import { h, Fragment } from 'preact';
import { AlbumGallery } from './AlbumGallery';
import { Router, Route } from 'preact-router';
import { Photos } from './Photos';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Album } from './Album';
import { Navigation } from './Navigation';

import './reset.css';

const theme = {
  mobileBreakpoint: '500px',
  desktopBreakpoint: '1000px',
};

const GlobalStyle = createGlobalStyle`

:root {
  --background-color-dark: #191919;
  --text-color-light: #ffffffd9;
  --text-shadow: -1px 1px 2px #00000099, 1px 1px 2px #00000099, 1px -1px 2px #00000099, -1px -1px 2px #00000099;
  --headline-font-family: 'Raleway', serif;
  --headline-normal-font-weight: 500;
  --headline-thin-font-weight: 100;
  --headline-bold-font-weight: 700;
  --text-font-family: 'Roboto', serif;
  --text-normal-font-weight: 400;
  --grid-gap: 16px;
  --mobile-breakpoint: ${theme.mobileBreakpoint};
  --desktop-breakpoint: ${theme.desktopBreakpoint};
  --content-max-width: 700px;
}
html {
  background-color: var(--background-color-dark);
}
body {
  font-family: var(--text-font-family);
  font-weight: var(--text-normal-font-weight);
  font-size: 16px;
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--headline-font-family);
    font-weight: var(--headline-thin-font-weight);
  }
}
`;

const AlbumsPage = () => (
  <Fragment>
    <Navigation />
    <AlbumGallery />
  </Fragment>
);
const PhotosPage = () => (
  <Fragment>
    <Navigation />
    <Photos />
  </Fragment>
);
const SinglePhotoPage = ({ photoId }: { photoId: string }) => (
  <Photos photoId={photoId} />
);
const AlbumPage = ({ albumId }: { albumId: string }) => (
  <Fragment>
    <Navigation />
    <Album albumId={albumId} />
  </Fragment>
);
const PhotoPage = ({
  albumId,
  photoId,
}: {
  albumId: string;
  photoId: string;
}) => <Album albumId={albumId} photoId={photoId} />;

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />

      <Router>
        <Route path="/" component={AlbumsPage} />
        <Route path="/photos" component={PhotosPage} />
        <Route path="/photo/:photoId" component={SinglePhotoPage} />
        <Route path="/album/:albumId" component={AlbumPage} />
        <Route path="/album/:albumId/photo/:photoId" component={PhotoPage} />
      </Router>
    </ThemeProvider>
  );
};
