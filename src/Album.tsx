import { Fragment, h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { thumb, sized } from './contentful';
import { Gallery, AlbumThumb, VideoThumb } from './AlbumGallery';
import { format } from 'date-fns';
import styled from 'styled-components';
import { route } from 'preact-router';
import { Photo, PhotoEl } from './Photo';
import { AlbumMap } from './AlbumMap';

const Header = styled.header`
  display: flex;
  color: var(--text-color-light);
  text-shadow: var(--text-shadow);
  flex-direction: column;
  align-content: center;
  align-items: center;
  background-size: cover;
  background-position: 50% 50%;
  min-height: 100vw;
  width: 100%;
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    height: 500px;
    min-height: auto;
  }
  justify-content: center;
  text-align: center;
  h1 {
    font-weight: normal;
    font-size: 20px;
    @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
      font-size: 30px;
    }
    @media (min-width: ${(props) => props.theme.desktopBreakpoint}) {
      font-size: 40px;
    }
    margin: 2rem;
  }
  > p {
    font-family: var(--text-font-family);
  }
  a {
    color: inherit;
    text-shadow: inherit;
  }
  position: relative;
`;

const Gradient = styled.div`
  content: ' ';
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgb(25 25 25) 10%, rgb(25 25 25 / 0%) 60%);
  position: absolute;
`;

const StyledGallery = styled(Gallery)`
  margin-top: -50px;
  ${PhotoEl} + & {
    margin-top: 0;
  }
`;

const Description = styled.div`
  margin: 1rem;
`;

const DescriptionSection = styled.section`
  position: absolute;
`;

export const Album = ({
  albumId,
  photoId,
}: {
  albumId: string;
  photoId?: string;
}) => {
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [cover, setCover] = useState<Photo | undefined>(undefined);
  const el = useRef<HTMLHeadElement>(null);
  useEffect(() => {
    fetch('/data/albums.json')
      .then((res) => res.json())
      .then((albums) => setAlbum({ ...albums[albumId], id: albumId }))
      .catch(() => {
        console.error(`Failed to load albums!`);
      });
  }, []);
  useEffect(() => {
    if (album === undefined) return;
    fetch(`/data/photos/${album.cover ?? album.photos[0]}.json`)
      .then((res) => res.json())
      .then((p) => {
        setCover(p);
      })
      .catch(() => {
        console.error(`Failed to load album cover: ${albumId}`);
      });
  }, [album]);

  return album === undefined ? (
    <p>Loading ...</p>
  ) : (
    <Fragment>
      {photoId === undefined && (
        <Header
          ref={el}
          style={{
            backgroundImage: cover
              ? `url(${sized({
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                })(cover)})`
              : undefined,
          }}
        >
          <Gradient />
          <DescriptionSection>
            <h1>{album.title}</h1>
            <p>
              {format(new Date(album.createdAt), 'd. LLLL yyyy')} &middot;{' '}
              {album.photos.length} photos
            </p>
            {album.html && (
              <Description dangerouslySetInnerHTML={{ __html: album.html }} />
            )}
          </DescriptionSection>
        </Header>
      )}
      {photoId && (
        <PhotoNavigator
          photoId={photoId}
          album={album}
          onClose={() => {
            route(`/album/${encodeURIComponent(albumId)}`);
          }}
        />
      )}
      <StyledGallery>
        {album.photos.map((photoId, k) => (
          <PhotoThumb
            id={photoId}
            key={k}
            onClick={() => {
              route(
                `/album/${encodeURIComponent(
                  albumId,
                )}/photo/${encodeURIComponent(photoId)}`,
              );
              window.scrollTo({ top: 0 });
            }}
          />
        ))}
      </StyledGallery>
      {!photoId && <AlbumMap album={album} />}
    </Fragment>
  );
};

const PhotoNavigator = ({
  photoId,
  album,
  onClose,
}: {
  photoId: string;
  album: Album;
  onClose?: () => unknown;
}) => {
  const getNextPhotoId = (increment = 1) =>
    album.photos[
      (album.photos.indexOf(photoId) + increment) % album.photos.length
    ];
  return (
    <Photo
      id={photoId}
      onPrev={() => {
        let k = album.photos.indexOf(photoId) - 1;
        if (k < 0) k = album.photos.length - 1;
        route(
          `/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(
            album.photos[k],
          )}`,
        );
        window.scrollTo({ top: 0 });
      }}
      onNext={() => {
        route(
          `/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(
            getNextPhotoId(),
          )}`,
        );
        window.scrollTo({ top: 0 });
      }}
      onLoad={(size) => {
        // Preload next image
        fetch(`/data/photos/${getNextPhotoId(2)}.json`)
          .then((res) => res.json())
          .then(async ({ url, image }) => {
            if (image !== undefined) {
              fetch(sized(size)({ url }));
            }
          });
      }}
      onClose={onClose}
    />
  );
};

export const PhotoThumb = ({
  id,
  onClick,
}: {
  id: string;
  onClick: () => unknown;
}) => {
  const el = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [video, setVideo] = useState<Video | undefined>(undefined);

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
    fetch(`/data/photos/${id}.json`)
      .then((res) => res.json())
      .then((p) => {
        if (p.image) {
          setVideo(undefined);
          setPhoto({ ...p, id });
        } else {
          setPhoto(undefined);
          setVideo({ ...p, id });
        }
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${id}`);
      });
  }, [visible]);

  if (video) return <VideoThumb onClick={onClick} />;

  return (
    <AlbumThumb
      ref={el}
      style={{
        backgroundImage: photo ? `url(${thumb(250)(photo)})` : undefined,
      }}
      onClick={onClick}
    />
  );
};
