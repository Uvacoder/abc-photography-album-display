import { format } from 'date-fns';
import { h } from 'preact';
import { useEffect, useRef, useState, useLayoutEffect } from 'preact/hooks';
import styled from 'styled-components';
import { sized } from './contentful';
import { Link, route } from 'preact-router';

export const Gallery = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    grid-gap: var(--grid-gap);
    margin: var(--grid-gap);
    grid-template-columns: repeat(
      auto-fit,
      minmax(calc(var(--mobile-breakpoint) / 2), 1fr)
    );
  }
`;
export const AlbumThumb = styled.div`
  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }
  background-size: cover;

  position: relative;
  cursor: pointer;
`;
export const VideoThumb = styled.div`
  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
    border: 1px solid var(--text-color-light);
  }
  position: relative;
  cursor: pointer;
`;
const Info = styled.div`
  position: absolute;
  color: var(--text-color-light);
  text-shadow: var(--text-shadow);
  padding: var(--grid-gap);
  bottom: 0;
  left: 0;
  h2 {
    font-size: 18px;
    font-weight: var(--headline-normal-font-weight);
  }
  p {
    font-size: 14px;
  }
`;
const StyledLink = styled(Link)`
  color: var(--text-color-light);
  text-decoration: none;
`;

export const AlbumGallery = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    fetch('/data/albums.json')
      .then((res) => res.json())
      .then((albums: Record<string, Album>) =>
        setAlbums(
          Object.entries(albums).map(([id, album]) => ({ ...album, id })),
        ),
      );
  }, []);

  if (albums.length === 0) return <p>Loading ...</p>;
  return (
    <Gallery>
      {albums.map((album, k) => (
        <AlbumThumbnail key={k} album={album} id={`${k}`} />
      ))}
    </Gallery>
  );
};

const AlbumThumbnail = ({ album, id }: { album: Album; id: string }) => {
  const el = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cover, setCover] = useState<Photo | undefined>(undefined);

  useLayoutEffect(() => {
    if (el.current !== null) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(el.current);
    }
  }, [el]);

  useEffect(() => {
    if (!visible) return;
    const cover = album.cover ?? album.photos[0];
    if (cover === undefined) return;
    fetch(`/data/photos/${cover}.json`)
      .then((res) => res.json())
      .then((p) => {
        setCover(p);
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${cover}`);
      });
  }, [visible]);

  return (
    <AlbumThumb
      ref={el}
      style={{
        backgroundImage: cover
          ? `url(${sized({
              width: el.current?.clientWidth,
              height: el.current?.clientHeight,
            })(cover)})`
          : undefined,
      }}
      onClick={() => {
        route(`/album/${encodeURIComponent(album.id)}`);
      }}
    >
      <StyledLink href={`/album/${encodeURIComponent(album.id)}`}>
        <Info>
          <h2>{album.title}</h2>
          <p>
            {album.photos.length} photos &middot;{' '}
            {format(new Date(album.createdAt), 'd. LLLL yyyy')}
          </p>
        </Info>
      </StyledLink>
    </AlbumThumb>
  );
};
