using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskFlow.Application.Interfaces.Auth;

namespace TaskFlow.Infrastructure.Identity.Jwt;

public sealed class HmacJwtTokenValidator : IJwtTokenValidator
{
    private readonly JwtOptions _options;

    public HmacJwtTokenValidator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public Guid? GetUserId(string token)
    {
        var parts = token.Split('.');

        if (parts.Length != 3)
            return null;

        if (!IsSignatureValid(parts[0], parts[1], parts[2]))
            return null;

        try
        {
            var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
            using var payload = JsonDocument.Parse(payloadJson);

            if (!IsIssuerValid(payload.RootElement) ||
                !IsAudienceValid(payload.RootElement) ||
                !IsTimeWindowValid(payload.RootElement))
            {
                return null;
            }

            if (payload.RootElement.TryGetProperty("sub", out var subject) &&
                Guid.TryParse(subject.GetString(), out var userId))
            {
                return userId;
            }

            return null;
        }
        catch (JsonException)
        {
            return null;
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private bool IsSignatureValid(string encodedHeader, string encodedPayload, string encodedSignature)
    {
        var expectedSignature = Sign($"{encodedHeader}.{encodedPayload}", _options.SecretKey);
        var expectedBytes = Encoding.ASCII.GetBytes(expectedSignature);
        var actualBytes = Encoding.ASCII.GetBytes(encodedSignature);

        return expectedBytes.Length == actualBytes.Length &&
            CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes);
    }

    private bool IsIssuerValid(JsonElement payload)
    {
        return payload.TryGetProperty("iss", out var issuer) &&
            issuer.GetString() == _options.Issuer;
    }

    private bool IsAudienceValid(JsonElement payload)
    {
        return payload.TryGetProperty("aud", out var audience) &&
            audience.GetString() == _options.Audience;
    }

    private static bool IsTimeWindowValid(JsonElement payload)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        if (payload.TryGetProperty("nbf", out var notBefore) &&
            notBefore.TryGetInt64(out var notBeforeValue) &&
            now < notBeforeValue)
        {
            return false;
        }

        return payload.TryGetProperty("exp", out var expiresAt) &&
            expiresAt.TryGetInt64(out var expiresAtValue) &&
            now < expiresAtValue;
    }

    private static string Sign(string unsignedToken, string secretKey)
    {
        var key = Encoding.UTF8.GetBytes(secretKey);
        var data = Encoding.UTF8.GetBytes(unsignedToken);

        using var hmac = new HMACSHA256(key);
        return Base64UrlEncode(hmac.ComputeHash(data));
    }

    private static byte[] Base64UrlDecode(string value)
    {
        var base64 = value
            .Replace('-', '+')
            .Replace('_', '/');

        var padding = base64.Length % 4;

        if (padding > 0)
            base64 = base64.PadRight(base64.Length + 4 - padding, '=');

        return Convert.FromBase64String(base64);
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
