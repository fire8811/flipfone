# Building FlipFone

This document explains how to run FlipFone locally and expose it to a mobile device using Cloudflare Tunnel.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm
- A Cloudflare account
- A local clone of the FlipFone repository

## Setup

1. Create a Cloudflare developer account  
   Sign up at [Cloudflare Developers](https://developers.cloudflare.com/).

2. Install `cloudflared`  
   Follow the installation instructions for your OS:  
   [Cloudflare Tunnel Downloads](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)

3. Login to CloudFlare  
   ```bash
    cloudflared tunnel login
4. Open two terminal windows  
   Both should be in the frontend directory.
5. Start the development server  
   In the first terminal:
   ```bash
   npm run dev
6. Start the CloudFlare tunnel  
   In the first terminal:
   ```bash
   npm run tunnel
7. Scan the QR code. The tunnel command will generate a QR code. Scan the QR code to visit the hosted site on mobile.