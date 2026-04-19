using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Infrastructure.Identity.Jwt;

public sealed class HmacJwtTokenGenerator : IJwtTokenGenerator
{
    private const int MinimumSecretLength = 32;
    private readonly JwtOptions _options;

    public HmacJwtTokenGenerator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public JwtToken Generate(User user)
    {
        ValidateOptions();

        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(_options.ExpirationMinutes);

        var header = new Dictionary<string, object>
        {
            ["alg"] = "HS256",
            ["typ"] = "JWT"
        };

        var payload = new Dictionary<string, object>
        {
            ["sub"] = user.Id.ToString(),
            [ClaimTypes.NameIdentifier] = user.Id.ToString(),
            [ClaimTypes.Name] = user.Name,
            [ClaimTypes.Email] = user.Email,
            ["name"] = user.Name,
            ["email"] = user.Email,
            ["jti"] = Guid.NewGuid().ToString(),
            ["iss"] = _options.Issuer,
            ["aud"] = _options.Audience,
            ["iat"] = ToUnixTimeSeconds(now),
            ["nbf"] = ToUnixTimeSeconds(now),
            ["exp"] = ToUnixTimeSeconds(expiresAt)
        };

        var encodedHeader = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(header));
        var encodedPayload = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(payload));
        var unsignedToken = $"{encodedHeader}.{encodedPayload}";

        var signature = Sign(unsignedToken, _options.SecretKey);
        var token = $"{unsignedToken}.{signature}";

        return new JwtToken(token, expiresAt);
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.Issuer))
            throw new InvalidOperationException("A configuração Jwt:Issuer é obrigatória.");

        if (string.IsNullOrWhiteSpace(_options.Audience))
            throw new InvalidOperationException("A configuração Jwt:Audience é obrigatória.");

        if (_options.ExpirationMinutes <= 0)
            throw new InvalidOperationException("A configuração Jwt:ExpirationMinutes deve ser maior que zero.");

        if (string.IsNullOrWhiteSpace(_options.SecretKey) ||
            _options.SecretKey.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase) ||
            _options.SecretKey.Length < MinimumSecretLength)
        {
            throw new InvalidOperationException(
                "Configure Jwt:SecretKey fora do repositório usando variável de ambiente, user secrets ou mecanismo equivalente.");
        }
    }

    private static string Sign(string unsignedToken, string secretKey)
    {
        var key = Encoding.UTF8.GetBytes(secretKey);
        var data = Encoding.UTF8.GetBytes(unsignedToken);

        using var hmac = new HMACSHA256(key);
        return Base64UrlEncode(hmac.ComputeHash(data));
    }

    private static long ToUnixTimeSeconds(DateTime dateTime)
    {
        return new DateTimeOffset(dateTime).ToUnixTimeSeconds();
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
