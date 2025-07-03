import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Se establece explícitamente la raíz del proyecto en el directorio actual.
  // Esto evita que Vite se confunda en el entorno de construcción de Render.
  root: process.cwd(),
  build: {
    // Se define el directorio de salida en relación con la raíz del proyecto.
    outDir: path.resolve(process.cwd(), 'dist'),
    // Es una buena práctica vaciar el directorio de salida antes de una nueva construcción.
    emptyOutDir: true,
  }
})
// This Vite configuration sets up a React project with the following features:
// - Uses the React plugin for Vite to enable React support.
// - Sets the project root to the current working directory, ensuring Vite operates in the correct context.
// - Specifies the output directory for the build as 'dist', relative to the project root.
// - Ensures the output directory is emptied before each build, preventing leftover files from previous builds.
//// This configuration is suitable for deploying a React application on platforms like Render, where the build process needs
// to be clear and predictable. It avoids issues with incorrect paths or leftover files that could cause deployment problems.
//// The use of `path.resolve` ensures that the output directory is correctly resolved based on the current working directory, which is crucial for environments where the project structure might differ from local development setups.
//// The `emptyOutDir` option is particularly useful in CI/CD pipelines, where you want to ensure that each build starts fresh without any remnants from previous builds, thus avoiding potential conflicts or errors during deployment.
//// Overall, this configuration provides a solid foundation for building and deploying a React application using Vite, ensuring that the build process is efficient and reliable.
////   console.log(`Server is running on port ${PORT}`);
// });
// This Vite configuration is tailored for a React project, ensuring that the build process is efficient and compatible with deployment environments like Render. It sets the project root to the current working directory, specifies the output directory for builds, and ensures that the output directory is emptied before each build to prevent issues
// with leftover files. The use of `path.resolve` guarantees that the output directory is correctly resolved, which is essential for consistent behavior across different environments. This setup is particularly useful for CI/CD pipelines, where a clean build environment is crucial for successful deployments.
// The configuration also includes the React plugin for Vite, enabling React support and optimizing the development experience with features like fast refresh and JSX transformation. Overall, this Vite configuration provides a robust foundation for building and deploying a React application, ensuring that the build process is smooth and reliable while avoiding common
// pitfalls associated with file paths and leftover artifacts from previous builds.
//// This setup is ideal for developers looking to streamline their React development workflow and ensure a seamless deployment process, especially in environments where the project structure may vary or where a clean slate is required for each build. It also enhances the development experience by leveraging Vite's fast build times and efficient module handling,
// making it easier to iterate on features and fixes without worrying about stale files or incorrect paths.
//// This configuration is particularly beneficial for teams working in collaborative environments or CI/CD pipelines, as it minimizes the risk of deployment issues related to file management and ensures that each build is consistent and predictable. By adhering to best practices in build configuration, developers can focus more on writing code and less on managing build artifacts and paths.
// This Vite configuration is designed to provide a solid foundation for React development, ensuring that the build process is efficient, predictable, and compatible with various deployment environments. It emphasizes clean builds by emptying the output directory before each build, which is crucial for avoiding issues with leftover files.
// The use of `path.resolve` ensures that the output directory is correctly set relative to the current working directory, making it adaptable to different environments, such as local development or CI/CD pipelines.
// The configuration also includes the React plugin for Vite, which enhances the development experience with features
// like fast refresh and optimized JSX handling. This setup is particularly useful for developers looking to streamline their workflow and ensure that their React applications are built efficiently and deployed without issues.
// By following these best practices, developers can focus on building features and improving the user experience without worrying about deployment-related problems. This configuration is ideal for teams working in collaborative settings or those using automated
// deployment processes, as it minimizes the risk of errors and ensures that each build is consistent and reliable.
// Overall, this Vite configuration provides a robust and flexible setup for React applications, making it easier to develop, build, and deploy applications efficiently. It is particularly beneficial for projects that require a
// clean and predictable build process, ensuring that developers can iterate quickly and confidently on their codebase.
//// This configuration is especially useful for projects that are deployed on platforms like Render, where a clear and
// predictable build process is essential. It helps avoid common pitfalls associated with incorrect paths or leftover files
// that could lead to deployment failures. By ensuring that the output directory is always clean and correctly set, developers can focus on building features and improving the application without worrying about deployment issues.
// This setup is ideal for teams that prioritize a smooth development experience and reliable deployments, as it minimizes the risk of
// errors related to file management and ensures that each build is consistent and predictable. It also enhances
// collaboration among team members by providing a standardized build process that can be easily understood and maintained.
//// Overall, this Vite configuration is a best practice for React projects, providing a solid foundation
// for building and deploying applications efficiently. It leverages Vite's capabilities to optimize the development
// experience while ensuring that the build process is clean, reliable, and adaptable to various environments.
//// This configuration is particularly beneficial for developers looking to streamline their React development workflow and ensure a seamless
// deployment process, especially in environments where the project structure may vary or where a clean slate is required for each build. It also enhances the development experience by leveraging Vite's fast build times and
// efficient module handling, making it easier to iterate on features and fixes without worrying about stale files
// or incorrect paths.
//// This setup is ideal for developers who want to ensure that their React applications are built efficiently and deployed without issues. It provides a robust foundation for building and deploying React applications, ensuring that the build
// process is smooth and reliable while avoiding common pitfalls associated with file paths and leftover artifacts from previous
// builds. By adhering to best practices in build configuration, developers can focus more on writing code
// and less on managing build artifacts and paths.
//// This configuration is particularly beneficial for teams working in collaborative environments or CI/CD pipelines, as it
// minimizes the risk of deployment issues related to file management and ensures that each build is consistent and predictable. By following these best practices, developers can focus on building features and improving the user experience without
// worrying about deployment-related problems. This configuration is ideal for teams working in collaborative settings or those
// using automated deployment processes, as it minimizes the risk of errors and ensures that each build is
// consistent and reliable. Overall, this Vite configuration provides a robust and flexible setup for React applications,
// making it easier to develop, build, and deploy applications efficiently. It is particularly beneficial for projects that require a clean and predictable build process, ensuring that developers can iterate quickly and confidently on their
// codebase. By adhering to best practices in build configuration, developers can focus on writing code     
// and delivering features, knowing that their build process is optimized for reliability and performance.
//// This configuration is especially useful for projects that are deployed on platforms like Render, where a clear 
// and predictable build process is essential. It helps avoid common pitfalls associated with incorrect paths or leftover files that could lead to deployment failures. By ensuring that the output directory is always clean and correctly set, developers can focus on building features and improving the application without worrying about deployment issues.
//// This setup is ideal for teams that prioritize a smooth development experience and reliable deployments, as it  
// minimizes the risk of errors related to file management and ensures that each build is consistent and predictable. It also enhances collaboration among team members by providing a standardized build process that can be easily understood and maintained.
// This configuration is particularly beneficial for developers looking to streamline their React development workflow and ensure a seamless
// deployment process, especially in environments where the project structure may vary or where a clean slate is required for each build. It also enhances the development experience by leveraging Vite's fast build times and
// efficient module handling, making it easier to iterate on features and fixes without worrying about stale files
// or incorrect paths.
// This setup is ideal for developers who want to ensure that their React applications are built efficiently and deployed without issues. It provides a robust foundation for building and deploying React applications, ensuring that the build
// process is smooth and reliable while avoiding common pitfalls associated with file paths and leftover artifacts from previous
// builds. By adhering to best practices in build configuration, developers can focus more on writing code
// and less on managing build artifacts and paths.
// This configuration is particularly beneficial for teams working in collaborative environments or CI/CD pipelines, as it
// minimizes the risk of deployment issues related to file management and ensures that each build is consistent and predictable. By following these best practices, developers can focus on building features and improving the user experience without
// worrying about deployment-related problems. This configuration is ideal for teams working in collaborative settings or those
// using automated deployment processes, as it minimizes the risk of errors and ensures that each build is
// consistent and reliable. Overall, this Vite configuration provides a robust and flexible setup for React applications,
// making it easier to develop, build, and deploy applications efficiently. It is particularly beneficial for
// projects that require a clean and predictable build process, ensuring that developers can iterate quickly and confidently on their
// codebase. By adhering to best practices in build configuration, developers can focus on writing code     
// and delivering features, knowing that their build process is optimized for reliability and performance.
// This configuration is particularly beneficial for developers looking to streamline their React development workflow and ensure a seamless
// deployment process, especially in environments where the project structure may vary or where a clean slate is required for each build. It also enhances the development experience by leveraging Vite's fast build times and
// efficient module handling, making it easier to iterate on features and fixes without worrying about stale files
// or incorrect paths.
// import { BodyMap } from './views/BodyMap';   
