#Run each command on Git Bash
openssl genrsa -out src/main/resources/jwt/rsaPrivateKey.pem 2048
openssl rsa -pubout -in src/main/resources/jwt/rsaPrivateKey.pem -out src/main/resources/jwt/publicKey.pem
openssl pkcs8 -topk8 -nocrypt -inform pem -in src/main/resources/jwt/rsaPrivateKey.pem -outform pem -out src/main/resources/jwt/privateKey.pem
