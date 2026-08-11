import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function CustomMap({ mapRegion, onRegionChangeComplete, streetAddress }) {
  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      region={mapRegion}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      <Marker 
        coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
        title="Delivery Location"
        description={streetAddress}
      />
    </MapView>
  );
}

