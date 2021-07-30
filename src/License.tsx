import { h } from 'preact';
import styled from 'styled-components';

const StyledLicense = styled.div`
  font-size: 14px;
  margin-top: 1rem;
`;

const Photographer = ({ media }: { media: Media }) => {
  if (media.photographer === undefined)
    return (
      <a
        href={'https://coderbyheart.com/'}
        target={'blank'}
        rel={'noreferrer noopener'}
      >
        Markus Tacker
      </a>
    );
  if (media.photographer.url === undefined)
    return <span>{media.photographer.name}</span>;
  return (
    <a
      href={media.photographer.url}
      target={'blank'}
      rel={'noreferrer noopener'}
    >
      {media.photographer.name}
    </a>
  );
};

export const License = ({ media }: { media: Media }) => (
  <StyledLicense>
    <p>
      Photo <em>{media.title}</em> by <Photographer media={media} />.
    </p>
    {(() => {
      switch (media.license) {
        case 'CC BY-ND 3.0':
          return (
            <p>
              Licensed under the{' '}
              <a
                href={'https://creativecommons.org/licenses/by-nd/3.0/'}
                target={'blank'}
                rel={'noreferrer noopener'}
              >
                Attribution-NoDerivs 3.0 Unported (CC BY-ND 3.0)
              </a>{' '}
              license.
            </p>
          );
        case 'CC BY-ND 4.0':
          return (
            <p>
              Licensed under the{' '}
              <a
                href={'https://creativecommons.org/licenses/by-nd/4.0/'}
                target={'blank'}
                rel={'noreferrer noopener'}
              >
                Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
              </a>{' '}
              license.
            </p>
          );
        case 'CC BY-SA 4.0':
          return (
            <p>
              Licensed under the{' '}
              <a
                href={'https://creativecommons.org/licenses/by-sa/4.0/'}
                target={'blank'}
                rel={'noreferrer noopener'}
              >
                Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
              </a>{' '}
              license.
            </p>
          );
        case 'CC0':
          <p>
            Licensed as
            <a
              href={
                'https://creativecommons.org/share-your-work/public-domain/cc0'
              }
              target={'blank'}
              rel={'noreferrer noopener'}
            >
              Public Domain
            </a>
            .
          </p>;
      }
    })()}
    <p>
      © {new Date(media.takenAt).getFullYear()} <Photographer media={media} />.
      All rights reserved.
    </p>
  </StyledLicense>
);
