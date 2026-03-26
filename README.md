# Vitamend

**Medicine donation + redistribution platform**

Created by: **Rachit Kumar Tiwari**

---

## Overview

Vitamend connects medicine donors with people in need via verified NGO partners. Our AI-powered verification system ensures safety and authenticity of donated medicines.

## Features

- 🏥 **Medicine Donation**: Upload photos of unused medicines
- 🤖 **AI Verification**: Automated safety and authenticity checks
- 🤝 **NGO Network**: Trusted partner organizations
- 📊 **Impact Tracking**: See how your donations help communities
- 🛒 **Shop**: Purchase verified medicines at subsidized prices (₹10-₹200)
- 👥 **Volunteer Program**: Join our community of helpers

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **AI/ML**: Custom OCR and verification service (FastAPI)
- **Deployment**: Vercel, Railway, MongoDB

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB database
- Python 3.9+ (for OCR service)


## API Endpoints

### Public
- `GET /api/shop/products` - List verified medicines
- `GET /api/founders` - Get founder information
- `POST /api/volunteer` - Submit volunteer application

### Authenticated
- `POST /api/donations` - Create donation
- `GET /api/donations` - List user's donations
- `GET /api/users/me` - Get current user

### Admin
- `GET /api/admin/medicines` - List pending medicines
- `PUT /api/admin/medicines` - Verify/reject medicine
- `GET /api/admin/volunteers` - List volunteers

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: vitamend.org@gmail.com

---

**Built with ❤️ by Rachit Kumar Tiwari**
