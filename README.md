# InnoTUGrid frontend

Welcome to the Angular Frontend for Data Visualization of Microgrids! This project is set up using the Angular CLI and allows you to create interactive data visualizations for microgrids. Follow the instructions below to get started with development.

![Bildschirmfoto vom 2024-02-06 11-09-30](https://github.com/innoTUgrid/frontend/assets/24190164/fa760016-706a-4d5d-9837-ceb11eb3788b)


## Prerequisites

Before you begin, ensure you have the following prerequisites installed on your system:

- Node.js and npm: Make sure you have Node.js and npm installed. You can download and install them from [https://nodejs.org/](https://nodejs.org/).

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/innoTUgrid/frontend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd frontend
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

## Development Server

To start the development server run:

```bash
npm run start
```

It will automatically reload the application when you make changes to the source code. The application will be available at `http://localhost:4200/`.

## Building for Production

When you're ready to build your application for production, you can use the following command:

```bash
npm run build
```

This will generate optimized production-ready files in the `dist/` directory.

## Building for Production with Docker

To build the application for production using Docker, you can use the following command:

```bash
docker build -t innotugrid-frontend .
```

This will create a Docker image with the name `innotugrid-frontend`. You can then run the image using the following command:

```bash
docker run -p 8080:80 -e API_URL=http://localhost:3000 innotugrid-frontend
```

This will start a container with the application running on port 8080. The `API_URL` environment variable is used to specify the URL of the backend API.

## Project Structure

The project structure follows Angular CLI conventions. Key directories and files include:

- `src/app/`: Contains the Angular application code.
- `src/app/components/`: Location for custom components.
- `src/app/services/`: Location for services. Here the data is fetched from the api and calculated for the visualization.
- `src/assets/`: Store static assets such as images and data files.
- `src/app/views/`: Location for the pages that use the components from the components folder. The URLs for the pages are defined in the `src/app/app-routing.module.ts`
- `angular.json`: Angular CLI configuration file.

## Further Help

This project leverages the following libraries for data visualization and UI components:

- [Highcharts](https://www.highcharts.com/): A powerful charting library for creating interactive and visually appealing charts.

- [highcharts-angular](https://github.com/highcharts/highcharts-angular): The official wrapper of Highcharts for angular.

- [Angular Material](https://material.angular.io/): A UI component library that follows the Material Design guidelines and provides a set of high-quality UI components for Angular applications.

Also refer to the [Angular documentation](https://angular.io/).

Happy coding! 🚀
