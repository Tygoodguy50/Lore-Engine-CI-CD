package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"log"
	"math/big"
	"net"
	"os"
	"time"
)

func main() {
	// Generate a private key
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Fatalf("Failed to generate private key: %v", err)
	}

	// Create certificate template with better compatibility
	template := x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			Organization:  []string{"Phantom Gear Technologies"},
			Country:       []string{"US"},
			Province:      []string{""},
			Locality:      []string{""},
			StreetAddress: []string{""},
			PostalCode:    []string{""},
			CommonName:    "phantomgear.it.com",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().Add(365 * 24 * time.Hour), // Valid for 1 year
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth},
		BasicConstraintsValid: true,
		IPAddresses:           []net.IP{net.IPv4(127, 0, 0, 1), net.IPv4(192, 168, 0, 187), net.IPv4(70, 189, 130, 198)},
		DNSNames:              []string{"localhost", "phantomgear.it.com", "api.phantomgear.it.com", "*.phantomgear.it.com"},
		IsCA:                  false,
	}

	// Create the certificate
	certDER, err := x509.CreateCertificate(rand.Reader, &template, &template, &privateKey.PublicKey, privateKey)
	if err != nil {
		log.Fatalf("Failed to create certificate: %v", err)
	}

	// Write certificate to file
	certOut, err := os.Create("tiktok-webhook.crt")
	if err != nil {
		log.Fatalf("Failed to open tiktok-webhook.crt for writing: %v", err)
	}
	defer certOut.Close()
	pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certDER})

	// Write private key to file
	keyOut, err := os.Create("tiktok-webhook.key")
	if err != nil {
		log.Fatalf("Failed to open tiktok-webhook.key for writing: %v", err)
	}
	defer keyOut.Close()
	pem.Encode(keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)})

	log.Println("✅ TikTok-compatible SSL certificate and key generated:")
	log.Println("   📄 Certificate: tiktok-webhook.crt")
	log.Println("   🔑 Private Key: tiktok-webhook.key")
	log.Println("   🌐 Valid for: phantomgear.it.com, api.phantomgear.it.com, *.phantomgear.it.com")
	log.Println("   🔢 IP Addresses: 127.0.0.1, 192.168.0.187, 70.189.130.198")
	log.Println("   📅 Expires: 1 year from now")
	log.Println("   🎯 Compatible with TikTok webhook requirements")
}
