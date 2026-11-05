/**
 * Garment Recognition Screen (`/(app)/test-garment`).
 * Redirects to the luxury GarmentStudioScreen (`/(app)/garment`).
 */
import React from 'react';
import { Redirect } from 'expo-router';

export default function TestGarmentScreen(): React.JSX.Element {
  return <Redirect href="/(app)/garment" />;
}
