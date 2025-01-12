using Amazon.S3;
using Amazon.S3.Transfer;
using backend.Configurations;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class S3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;

        public S3Service(IOptions<AwsSettings> awsSettings)
        {
            _s3Client = new AmazonS3Client(awsSettings.Value.AccessKey, awsSettings.Value.SecretKey, Amazon.RegionEndpoint.USEast1);
            _bucketName = awsSettings.Value.BucketName;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {         
            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = fileStream,
                Key = fileName,
                BucketName = _bucketName,
            };

            var transferUtility = new TransferUtility(_s3Client);
            await transferUtility.UploadAsync(uploadRequest);

            //return the url
            return $"https://{_bucketName}.s3.amazonaws.com/{fileName}";
        }
    }
}
