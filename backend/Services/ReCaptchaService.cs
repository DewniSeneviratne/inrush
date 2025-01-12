using backend.Configurations;
using Microsoft.Extensions.Options;
using System;

namespace backend.Services
{
    using Newtonsoft.Json;
    using System.Net.Http;
    using System.Threading.Tasks;

    public class ReCaptchaService
    {
        private readonly string _secretKey;

        public ReCaptchaService(IConfiguration configuration)
        {
            _secretKey = configuration.GetValue<string>("reCAPTCHA:SecretKey");
        }

        public async Task<bool> VerifyCaptchaAsync(string captchaResponse)
        {
            if (string.IsNullOrEmpty(captchaResponse))
                return false;

            var client = new HttpClient();
            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
            var requestContent = new FormUrlEncodedContent(new[]
            {
            new KeyValuePair<string, string>("secret", _secretKey),
            new KeyValuePair<string, string>("response", captchaResponse)
        });

            var response = await client.PostAsync(verificationUrl, requestContent);
            var jsonResponse = await response.Content.ReadAsStringAsync();
            var captchaResult = JsonConvert.DeserializeObject<ReCaptchaResponse>(jsonResponse);

            return captchaResult?.Success ?? false;
        }
    }

    public class ReCaptchaResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }
        [JsonProperty("error-codes")]
        public string[] ErrorCodes { get; set; }
    }


}
