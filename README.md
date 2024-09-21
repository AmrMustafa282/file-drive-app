# File Drive

This repository contains the source code for a file drive application. The application allows users to upload files such as images, PDFs and CSVs, create organitions or invite users to your org , upload in your personal space or your orgs , delete and restore files within 30 days if admin or in your personal space.

## Key Features

- **Authentication**: Sign-up, Sign-in, email verfication, forget password and more ... .
- **Email-Feedback**: send emails to users with clerk to notify them if something happend.
- **Organitations**: shared space with users where they can upload files there.
- **Role-Based Authorization**: only admins who can delete and restore files in organizations.

## Tech Stack

- **Front-end**: Nextjs, Shadcn, Tailwind for client-side.
- **Backend**: Convex, Clerk for rubost backend and authentication.

## Getting Started

1. **Clone the repository**:

```bash
   git clone https://github.com/AmrMustafa282/file-drive-app
```

2. **Set up Environment**:Create .env and add

- CONVEX_DEPLOYMENT
- NEXT_PUBLIC_CONVEX_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- CLERK_HOSTNAME

3. **Start the convex server**: `npx convex dev`
4. **Start the development server**: `npm run dev`
5. **Open the application**: Visit `http://localhost:3000` in your browser.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](MTI) file for details.

## Acknowledgements

- This project was inspired by [@Web Dev Cody](https://github.com/webdevcody) [Tutorial](https://www.youtube.com/watch?v=27hMNWcsa-Y&t=179s&ab_channel=WebDevCody) .
- Special thanks to the contributors and maintainers of the technologies used in this project.

Feel free to reach out with any questions or feedback!

![](/public/readme/home.png)
![](/public/readme/all-files.png)
![](/public/readme/all-files-2.png)
![](/public/readme/fev.png)
![](/public/readme/all-org.png)
![](/public/readme/all-org-2.png)
![](/public/readme/account.png)

```

```
