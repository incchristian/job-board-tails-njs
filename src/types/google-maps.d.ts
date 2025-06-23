declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        places: {
          Autocomplete: any;
          PlacesServiceStatus: any;
        };
        Marker: any;
        InfoWindow: any;
        event: any;
        LatLng: any;
      };
    };
  }
}

export {};