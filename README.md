# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## API server (user/time-block storage)

The front-end and Chrome extension talk to an Express API backed by MongoDB (Atlas or self-hosted).

1. Install dependencies (`npm install` if you haven’t already).
2. Copy `.env.example` to `.env` and set:
   - `MONGODB_URI` – either a local connection string (`mongodb://127.0.0.1:27017/focusblock`) or an Atlas URI.
   - `PORT` / `REACT_APP_API_URL` if you need something other than the defaults.
3. Run `npm run server` to start the API on `http://localhost:4000`.

> Tip: MongoDB Atlas has a generous free tier. Create a cluster, add a database user, and paste the provided connection string (with your credentials) into `MONGODB_URI`. The API uses SHA-256 hashes for demo purposes and should not be considered production-grade auth.

## Chrome extension

The `extension/` directory contains the FocusBlock Shield extension that blocks distracting websites whenever one of your scheduled blocks is active.

1. Build/run the API server so the extension has data to query.
2. Go to `chrome://extensions`, enable Developer Mode, and load the unpacked folder at `extension/`.
3. Open the extension’s options page, confirm the API URL (point it at your hosted API if you deployed it), and sign in with the same credentials you use in the web UI.
4. Keep the extension enabled in Chrome to enforce the schedules in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
