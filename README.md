[![semantic-release: angular](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

# lucabertelli.consulting Portfolio and Blog

Welcome to the official repository for Luca Bertelli's portfolio and blog site, showcasing the expertise and experience of a Cloud Native Engineer, Advisor, Consultant, and Developer. 🚀

## Overview

This website is designed to provide a comprehensive view of Luca Bertelli's professional journey, skills, and insights into the world of cloud-native technologies. Whether you are looking for information about cloud architecture, development strategies, or seeking consultation services, this site is the go-to resource. 🌐

## Technologies Used

The site is built with [Astro](https://astro.build/), a modern front-end framework that blends the best of traditional server-rendered static sites with modern client-side rendering (CSR). Astro allows for a fast and optimized user experience while maintaining the simplicity and performance of static sites. 🛠️

## Features

- **Portfolio Showcase:** Explore Luca's past projects and discover the innovative solutions implemented in various cloud environments.

- **Blog:** Stay updated with the latest trends, insights, and best practices in cloud-native engineering. Luca shares his knowledge and experiences through thought-provoking articles and tutorials. 📚

- **Consulting Services:** Interested in leveraging cloud-native technologies for your business? Luca Bertelli offers advisory and consulting services. Get in touch to discuss how to optimize your cloud strategy. 🤝

- **Contact:** Reach out to Luca for inquiries, collaboration opportunities, or to schedule a consultation. The contact form ensures a seamless communication process. 📬

## Project structure

Below is a standard project structure for an Astro project site:

```plaintext
lucabertelli.consulting/
├── public
│   ├── about
│   │   └── certifications
│   ├── blog
│   │   └── ...
│   ├── contact
│   ├── expertise
│   ├── fonts
│   ├── lang
│   ├── notification
│   ├── scripts
│   ├── shape
│   ├── social-influence
│   ├── styles
│   ├── tickets
│   └── webfonts
└── src
    ├── components
    ├── content
    │   ├── blog
    │   │   └── ...
    │   └── certifications
    ├── i18n
    ├── layouts
    └── pages
        └── [lang]
            └── blog
```

Explanation of key directories and files:

- **src/:** The source directory where you write your site's components, layouts, pages, and styles.
  - **components/:** Reusable components used across the site.
  - **content/:** Blog articles and certifications badges.
  - **i18n/:** Translation files.
  - **layouts/:** Layouts define the structure of pages.
  - **pages/:** Contains pages of the site. Each `.astro` file corresponds to a page.
- **public/:** Static assets that you want to be publicly accessible on your website. These assets can include files like images, fonts, CSS files, JavaScript files, and other resources that don't need to be processed by a build step.

Feel free to adapt this structure based on your specific needs and preferences.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/banshee86vr/lucabertelli.consulting.git
   ```

2. Navigate to the project directory:

   ```bash
   cd lucabertelli.consulting
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open your browser and visit [http://localhost:4321](http://localhost:4321) to view the site locally. 🌐

## Contributions

If you have suggestions, improvements, or would like to report issues, feel free to open an [issue](https://github.com/banshee86vr/lucabertelli.consulting/issues) or submit a [pull request](https://github.com/banshee86vr/lucabertelli.consulting/pulls). 🙌

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 📄

---

Thank you for visiting Luca Bertelli Consulting! Explore, learn, and connect with the cloud-native community. 🌟
