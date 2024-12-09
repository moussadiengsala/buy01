
// generate keystore.p12 files
keytool -genkeypair -alias dev-localhost -keyalg RSA -keysize 2048 -validity 365 -storetype PKCS12 -keystore keystore.p12 -storepass changeit
