import { h } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { sized } from './contentful';
import styled from 'styled-components';
import { X as CloseIcon } from './icons/X';
import { ChevronLeft as PrevIcon } from './icons/ChevronLeft';
import { ChevronRight as NextIcon } from './icons/ChevronRight';
import { Download as DownloadIcon } from './icons/Download';
import { MapPin as MapIcon } from './icons/MapPin';
import { License } from './License';
import { Link } from 'preact-router';

export const Dim = styled.div`
  display: flex;
  position: relative;
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Fullscreen = styled.div`
  height: 100vh;
  width: 100vw;
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    height: calc(100vh - 2 * var(--grid-gap));
    width: calc(100vw - 3 * var(--grid-gap));
  }
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  video {
    height: 100%;
  }
  display: flex;
  align-content: center;
  justify-content: center;
`;
const PrevNav = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  left: 0;
  display: flex;
  align-content: center;
  align-items: center;
  color: var(--text-color-light);
  svg {
    display: none;
  }
  &:hover {
    svg {
      display: inline-block;
      opacity: 50%;
    }
  }
`;
const NextNav = styled(PrevNav)`
  left: auto;
  right: 0;
  justify-content: flex-end;
`;
const Button = styled.button`
  color: var(--text-color-light);
  position: absolute;
  top: 0;
  right: 0;
  padding: 0;
  border: 0;
  background: transparent;
  opacity: 50%;
`;
const Info = styled.aside`
  color: var(--text-color-light);
  h1 {
    font-weight: var(--headline-normal-font-weight);
  }
  a {
    color: inherit;
  }
  margin: 2rem auto 4rem auto;
  max-width: var(--content-max-width);
  svg {
    height: 20px;
    width: 20px;
    margin: 0 0.25rem;
    transform: translateY(4px);
  }
`;
const Description = styled.div`
  margin: 1rem;
`;

export const PhotoEl = styled.main``;

export const Photo = ({
  id,
  onNext,
  onPrev,
  onClose,
  onLoad,
}: {
  id: string;
  onNext?: () => unknown;
  onPrev?: () => unknown;
  onClose?: () => unknown;
  onLoad?: ({ width, height }: { width: number; height: number }) => unknown;
}) => {
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [photoSrc, setPhotoSrc] = useState<string | undefined>(undefined);
  const [video, setVideo] = useState<Video | undefined>(undefined);

  useLayoutEffect(() => {
    window.onkeyup = ({ key }: KeyboardEvent) => {
      switch (key) {
        case 'ArrowRight':
          onNext?.();
          return;
        case 'ArrowLeft':
          onPrev?.();
          return;
        case 'Escape':
          onClose?.();
          return;
      }
    };
  }, []);

  useEffect(() => {
    fetch(`/data/photos/${id}.json`)
      .then((res) => res.json())
      .then((p) => {
        if ('image' in p) {
          setVideo(undefined);
          setPhoto({ ...p, id });
          setPhotoSrc(
            sized({
              width: document.documentElement.clientWidth,
              height: document.documentElement.clientHeight,
            })({ ...p, id }),
          );
        } else {
          setPhoto(undefined);
          setPhotoSrc(undefined);
          setVideo({ ...p, id });
          onLoad?.({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          });
        }
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${id}`);
      });
  }, [id]);

  useEffect(() => {
    if (photoSrc === undefined) return;
    fetch(photoSrc).then(() =>
      onLoad?.({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      }),
    );
  }, [photoSrc]);

  if (photo === undefined && video === undefined) return null;

  const media = (photo ?? video) as Media;

  return (
    <PhotoEl>
      <Dim>
        {photoSrc && (
          <Fullscreen
            style={{
              backgroundImage: photoSrc ? `url(${photoSrc})` : undefined,
            }}
          />
        )}
        {video && (
          <Fullscreen>
            <video src={video.url} autoPlay={true} />
          </Fullscreen>
        )}
        <PrevNav onClick={() => onPrev?.()}>
          <PrevIcon />
        </PrevNav>
        <NextNav onClick={() => onNext?.()}>
          <NextIcon />
        </NextNav>
        <Button onClick={() => onClose?.()}>
          <CloseIcon />
        </Button>
      </Dim>
      <Info>
        <h1>{media.title}</h1>
        {media.tags &&
          media.tags.map((tag, k) => (
            <Link key={k} href={`/tags/${tag}`}>
              #{tag}
            </Link>
          ))}
        {media.html && (
          <Description dangerouslySetInnerHTML={{ __html: media.html }} />
        )}
        {media.geo && (
          <p>
            <a
              href={`https://www.google.com/maps/search/${media.geo.lat},${media.geo.lng}`}
              target={'blank'}
              rel={'noreferrer noopener'}
            >
              <MapIcon /> {media.geo.lat}, {media.geo.lng}
            </a>
          </p>
        )}
        {media.license !== 'None' && (
          <p>
            <a title={'Download'} href={media.url} target={'blank'}>
              <DownloadIcon />
              {(media.size / 1024 / 1024).toFixed(1)} MB
            </a>
          </p>
        )}
        <License media={media} />
      </Info>
    </PhotoEl>
  );
};
