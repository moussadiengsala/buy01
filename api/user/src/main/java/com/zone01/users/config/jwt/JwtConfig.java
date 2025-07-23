package com.zone01.users.config.jwt;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

import java.security.interfaces.RSAPublicKey;

// sets up the RSA key pair and the necessary beans for JWT encoding and decoding
// It generates an RSA key pair and configures JWT encoding & decoding.
@Configuration
public class JwtConfig {

    @Value("${application.security.jwt.key-id}")
    private String keyId;

    /*
    * example result:
    * {
          "kty": "RSA",
          "kid": "my-key-id",
          "use": "sig",
          "n": "1234abcd...",  // Public Key (Base64 Encoded)
          "e": "AQAB",
          "d": "abcd1234..."   // Private Key (Base64 Encoded)
      }
    * */
    @Bean
    public RSAKey rsaKey() throws NoSuchAlgorithmException {
        // Generates a new RSA key pair (public & private key)
        KeyPair keyPair = KeyPairGenerator.getInstance("RSA")
                .generateKeyPair();

        // Creates a JWK object (JSON Web Key)
        return new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                .privateKey(keyPair.getPrivate())
                .keyID(keyId) // Assigns a key ID (kid)
                .build();
    }

    /*
    * Example Output (JWK Set)
    * {
          "keys": [
            {
              "kty": "RSA",
              "kid": "my-key-id",
              "use": "sig",
              "n": "1234abcd...",  // Public Key (Base64 Encoded)
              "e": "AQAB"
            }
          ]
      }
    * */
    @Bean
    public JWKSource<SecurityContext> jwkSource(RSAKey rsaKey) {
        // Wraps the RSA key (public & private) in a JWK (JSON Web Key) set
        // JWKSet is a collection of keys used for JWT signing and verification.
        JWKSet jwkSet = new JWKSet(rsaKey);
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }

    // The JwtEncoder uses the private RSA key to sign the JWT
    //  Now, we can generate a JWT token using JwtService
    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    /*
        * When a user sends the JWT back (e.g., in an Authorization header), the server will:
            Extract the JWT from the request.
            Verify the signature using the public RSA key.
            Decode the token and extract the user info.
    * */
    @Bean
    public JwtDecoder jwtDecoder(RSAKey rsaKey) throws JOSEException {
        return NimbusJwtDecoder.withPublicKey(rsaKey.toRSAPublicKey())
                .build();
    }
}
