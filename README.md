## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**
    Open your terminal, navigate to where you want to store the project, and run the following command:
    ```bash
    git clone https://github.com/dantenvmt/website.git
    ```

2.  **Navigate to the project directory**
    ```bash
    cd website
    ```

3.  **Install dependencies**
    This command reads the `package.json` file and installs all the necessary packages for the project to run.
    ```bash
    npm install
    ```

4.  **Run the development server**
    This will start the application on a local server.
    ```bash
    npm start
    ```
    Once it's running, open your web browser and go to `http://localhost:3000` to see the application live. The page will automatically reload as you make changes to the code.

---

## Project Structure

Understanding the layout of the project will help you find your way around the codebase. Here is a breakdown of the key directories and files:
```
website/
├── public/
│   ├── index.html      # The main HTML template for the app
│   └── ...             # Other static assets like images and favicons
│
├── src/
│   ├── components/     # Reusable UI components (e.g., Button, Footer)
│   │   ├── common/
│   │   ├── layout/
│   │   └── resume/
│   │
│   ├── context/        # React Context for global state (e.g., AuthContext)
│   │
│   ├── data/           # Mock data files for development
│   │
│   ├── pages/          # Top-level page components for each route
│   │   ├── company/
│   │   ├── resume/
│   │   └── ...
│   │
│   ├── App.js          # The root component, defines application routes
│   ├── index.css       # Global styles
│   └── index.js        # The entry point of the application
│
├── .gitignore          # Files and folders for Git to ignore
├── package.json        # Lists project dependencies and scripts
└── README.md           # You are here!
```
### Key Directories Explained

* **`/public`**: This directory contains the main `index.html` file that serves as the entry point for the web app. It also holds static assets like images, logos, and fonts that don't get processed by our build tools.

* **`/src`**: This is where most of the application's code lives.
    * **`/src/components`**: Home to all reusable components. If you build a component that might be used in more than one place (like a button or a card), it should go here.
    * **`/src/context`**: Used for managing global state. For example, `AuthContext.js` manages the user's authentication status across the entire application.
    * **`/src/data`**: Contains mock data used to populate the UI during development before connecting to a live backend.
    * **`/src/pages`**: Contains the main components that represent a full page or view in the application (e.g., `HomePage.js`, `AboutPage.js`). These are typically assembled using smaller components from the `/components` directory.

---