import { UserRole } from '.prisma/client';
import { Ngo } from '.prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { ensureAuthenticated } from '../middleware/auth';
import axios from 'axios';
import Geocode from '../types/geocode';

const router = Router();

function formatGeocodeURL(location: string) {
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    location
  )}.json?access_token=${process.env.MAPBOX_TOKEN}`;
}

type Coords = [lon: number, lat: number];

async function geocodeLocation(location: string): Promise<Coords> {
  const { data } = await axios.get<Geocode.RootObject>(
    formatGeocodeURL(location)
  );

  return data.features[0].center as Coords;
}

router.post('/', ensureAuthenticated, async (req, res) => {
  if (!req.user) return;

  const data = req.body as {
    ngoId?: string;
    nearest: boolean;
    description: string;
    quantity: number;
    location: string;
    donationId: string;
  };

  let ngo: Ngo;

  if (data.nearest) {
    // TODO calc nearest ngo
    ngo = await prisma.ngo.findFirst();
  } else {
    ngo = await prisma.ngo.findUnique({
      where: { id: data.ngoId },
    });
  }

  if (!ngo) {
    return res.status(400).json({
      message: "Sorry, we don't have any NGO near your location",
    });
  }

  // TODO find the nearest driver based on `currentCoords`
  const assignedTo = await prisma.user.findFirst({
    where: { role: UserRole.PICKUP },
  });

  if (!assignedTo) {
    return res.status(400).json({
      message: 'Sorry, there is currently no driver near you',
    });
  }

  const donatorCoords = await geocodeLocation(data.location);

  const donation = await prisma.donation.create({
    data: {
      id: data.donationId,
      description: data.description,
      quantity: data.quantity,
      donatorId: req.user.id,
      ngoId: ngo.id,
      pickup: {
        create: {
          assignedToId: assignedTo.id,
          pickupCoords: {
            set: assignedTo.currentCoords,
          },
          donatorCoords: {
            set: donatorCoords,
          },
          donatorLocation: data.location,
        },
      },
    },
  });

  res.json({
    message: 'Thanks for your contribution!',
    ngo: ngo.name,
  });
});

export default router;
