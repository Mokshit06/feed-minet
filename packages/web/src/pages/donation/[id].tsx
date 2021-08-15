import { Box, Flex } from '@chakra-ui/layout';
import type { Donation, Ngo, Pickup, User } from '@prisma/client';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import mapboxgl from 'mapbox-gl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useUser } from '../../hooks/auth';
import Directions from '../../types/directions';

type Coords = [lon: number, lat: number];

function formatDirectionsURL(origin: Coords, destination: Coords) {
  return `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${encodeURIComponent(
    `${origin.join(',')};${destination.join(',')}`
  )}?alternatives=true&geometries=geojson&steps=true&access_token=${
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  }`;
}

async function getDirections(from: Coords, to: Coords) {
  const res = await fetch(formatDirectionsURL(from, to));
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as Directions.Error).code);
  }

  return data as Directions.RootObject;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function SingleDonation() {
  const router = useRouter();
  const donationId = router.query.id as string;
  const { data: user } = useUser();
  const { data: donation } = useQuery<
    Donation & {
      ngo: Ngo;
      donator: User;
      pickup: Pickup;
    }
  >(['/donation', donationId], {
    enabled: !!donationId,
  });
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!donation || !user) return;

    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mokshit06/cks6ysuez0lvb18qn8fa2zvdb',
      center: [-74.0066, 40.7135],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      const layers = map.getStyle().layers;
      if (!layers) return;

      const labelLayerId = layers.find(
        layer => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;
      map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#0a0f16',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.8,
          },
        },
        labelLayerId
      );
    });

    const pickupCoords = donation.pickup.pickupCoords as Coords;
    const donatorCoords = donation.pickup.donatorCoords as Coords;

    console.log({ pickupCoords, donatorCoords });

    map.fitBounds(
      [
        new mapboxgl.LngLat(...pickupCoords),
        new mapboxgl.LngLat(...donatorCoords),
      ],
      { bearing: 0, pitch: 0, padding: 100 }
    );

    async function showDirections() {
      const directionsData = await getDirections(pickupCoords, donatorCoords);
      const route = directionsData.routes[0];

      const geojson: Feature<Geometry, GeoJsonProperties> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.geometry.coordinates,
        },
      };

      if (map.getSource('route')) {
        (map.getSource('route') as any).setData(geojson);
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#066adb',
            'line-width': 12,
            'line-opacity': 0.75,
          },
        });
      }
    }

    showDirections();

    return () => {
      map.remove();
    };
  }, [donation, user]);

  if (!donation) return null;

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>
        <title>Do a Donation</title>
      </Head>
      <Flex w="full" my={8} mx={6} maxW="1100px">
        <Box w="40vw" height="60vh">
          <Box height="full" width="full" id="map"></Box>
        </Box>
        <Box></Box>
      </Flex>
    </Flex>
  );
}
