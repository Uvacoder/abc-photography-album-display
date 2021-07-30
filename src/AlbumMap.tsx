import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/hooks';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import { thumb } from './contentful';
import { route } from 'preact-router';

mapboxgl.accessToken = import.meta.env.SNOWPACK_PUBLIC_MAPBOX_TOKEN;

const AlbumContainer = styled.aside`
  background-color: var(--text-color-light);
  color: var(--background-color-dark);
  padding: 1rem;
`;

const MapContainer = styled.div`
  height: 80vh;
`;

const MapIcon = styled.div`
  background-image: url('/mapbox-icon.png');
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 10%;
  cursor: pointer;
  box-shadow: 0 0 5px 0px #00000073;
`;

type PhotoWithLocation = Photo & { geo: { lat: number; lng: number } };

export const AlbumMap = ({ album }: { album: Album }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map>(null);
  const [photos, setPhotos] = useState<PhotoWithLocation[]>([]);
  useEffect(() => {
    if (map.current !== null || mapContainer.current === null) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.394980097332425, 63.43050145201516],
      zoom: 6,
    });

    if (album.track !== undefined) {
      map.current.on('load', () => {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: (album.track as string[]).map((pos) =>
                pos.split(',').map(parseFloat),
              ),
            },
          },
        });
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.5,
            'line-width': 6,
          },
        });
      });
    }

    Promise.all(
      album.photos.map((id) =>
        fetch(`/data/photos/${id}.json`)
          .then((res) => res.json())
          .then((photo) => ({ ...photo, id })),
      ),
    )
      .then((photosWithMaybeLocation) =>
        photosWithMaybeLocation.filter(({ geo }) => geo !== undefined),
      )
      .then((photosWithLocation) => {
        setPhotos(photosWithLocation);
      });
  });

  return (
    <AlbumContainer>
      <MapContainer ref={mapContainer}>
        {photos.map((photo) => (
          <MapMarker album={album} photo={photo} map={map.current} />
        ))}
      </MapContainer>
    </AlbumContainer>
  );
};

const MapMarker = ({
  album,
  photo,
  map,
}: {
  album: Album;
  photo: PhotoWithLocation;
  map: mapboxgl.Map;
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  const marker = useRef<mapboxgl.Marker>(null);
  useEffect(() => {
    if (marker.current !== null || markerRef.current === null) return; // initialize marker only once
    marker.current = new mapboxgl.Marker(markerRef.current)
      .setLngLat(photo.geo)
      .addTo(map);
  });
  return (
    <MapIcon
      ref={markerRef}
      style={{ backgroundImage: `url(${thumb(50)(photo)})` }}
      onClick={() => {
        route(
          `/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(
            photo.id,
          )}`,
        );
      }}
    />
  );
};
