import { h } from 'preact';
import styled from 'styled-components';
import { Link } from 'preact-router';

const Header = styled.header`
  color: var(--text-color-light);
  font-size: 12px;
  font-family: var(--headline-font-family);
  font-weight: var(--headline-normal-font-weight);
  padding: 0 1rem;
  h1 {
    font-size: inherit;
    font-weight: inherit;
    strong {
      font-weight: var(--headline-bold-font-weight);
      text-transform: uppercase;
    }
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  nav {
    > a + a {
      :before {
        content: '·';
        padding: 0.5rem;
      }
    }
  }
  section {
    display: flex;
    justify-content: space-between;
    margin: 1rem auto;
    max-width: var(--content-max-width);
  }
`;

export const Navigation = () => (
  <Header>
    <section>
      <h1>
        <a href={'https://coderbyheart.com'} rel="me">
          <strong>Markus Tacker</strong>
        </a>
        {' · '}
        Photos
      </h1>
      <nav>
        <Link href="/">Albums</Link>
        <Link href="/photos">All photos</Link>
        <Link href="/map">Map</Link>
      </nav>
    </section>
  </Header>
);
