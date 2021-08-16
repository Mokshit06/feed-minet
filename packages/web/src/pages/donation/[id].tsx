import {
  Box,
  Flex,
  Text,
  Heading,
  Tag,
  Button,
  useToast,
  List,
  ListItem,
} from '@chakra-ui/react';
import {
  Donation,
  Ngo,
  Pickup,
  User,
  UserRole,
  PickupStatus,
} from '@prisma/client';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import mapboxgl from 'mapbox-gl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useUser } from '../../hooks/auth';
import api from '../../lib/api';
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
  const toast = useToast();
  const [directions, setDirections] = useState([]);
  const { data: user } = useUser();
  const { data: donation } = useQuery<
    Donation & {
      ngo: Ngo & { owner: User };
      donator: User;
      pickup: Pickup;
    }
  >(['/donation', donationId], {
    enabled: !!donationId,
  });
  const queryClient = useQueryClient();
  const pickupStatus = useMutation(
    async (status: string) =>
      api.post(`/pickup/${donation?.pickup.id}/${status}`),
    {
      onSuccess() {
        queryClient.invalidateQueries(['/donation', donationId]);
        toast({
          title: 'Pickup has started!',
          description: `You are currently doing the pickup`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );
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

    if (
      pickupCoords.length < 2 ||
      pickupCoords.every(x => typeof x !== 'number')
    )
      return;
    if (
      donatorCoords.length < 2 ||
      donatorCoords.every(x => typeof x !== 'number')
    )
      return;

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
      const directions = route.legs[0].steps.map(step => {
        return step.maneuver.instruction;
      });
      setDirections(directions as any);

      const geojson: Feature<Geometry, GeoJsonProperties> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.geometry.coordinates,
        },
      };

      if (map?.getSource('route')) {
        (map?.getSource('route') as any).setData(geojson);
      } else {
        map?.addLayer({
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
      map?.remove();
    };
  }, [donation, user]);

  if (!donation || !user) return null;

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>
        <title>Do a Donation</title>
      </Head>
      <Flex direction="column" maxW="1100px">
        <Flex gridGap={6} w="full" my={8} mx={6}>
          <Box w="40vw" height="60vh">
            <Box height="full" width="full" id="map"></Box>
          </Box>
          <Box>
            <Heading mb={4}>{donation.ngo.name}</Heading>
            <Box lineHeight="1.8" fontSize="xl">
              <Text>Donator: {donation.donator.name}</Text>
              <Text d="flex" alignItems="center">
                Donator Role: &nbsp;<Tag>{donation.donator.role}</Tag>
              </Text>
              <Text d="flex" alignItems="center">
                Pickup status: &nbsp;<Tag>{donation.pickup.status}</Tag>
              </Text>
              <Text>
                Pickup started at: {donation.pickup.startedAt || 'NA'}
              </Text>
              <Text>Pickup location: {donation.pickup.donatorLocation}</Text>
              <Text>Contents: {donation.description}</Text>
              <Text>Number of plates: {donation.quantity}</Text>
              <Text>Owner of NGO: {donation.ngo.owner?.name}</Text>
            </Box>
            {user.role === UserRole.PICKUP &&
              (donation.pickup.status === PickupStatus.IDLE ? (
                <Button
                  onClick={() => pickupStatus.mutate('start')}
                  mt={4}
                  size="lg"
                >
                  Start pickup
                </Button>
              ) : donation.pickup.status === PickupStatus.ACTIVE ? (
                <Button
                  onClick={() => pickupStatus.mutate('complete')}
                  mt={4}
                  size="lg"
                >
                  Complete pickup
                </Button>
              ) : (
                <Button disabled mt={4} size="lg">
                  Pickup completed
                </Button>
              ))}
          </Box>
        </Flex>
        {user.role === UserRole.PICKUP && (
          <Box w="full" my={8} mx={6}>
            <Heading mb={4}>Directions</Heading>
            <List lineHeight="1.5" fontSize="lg">
              {directions.map((direction, index) => (
                <ListItem key={`${direction}-${index}`}>{direction}</ListItem>
              ))}
            </List>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
