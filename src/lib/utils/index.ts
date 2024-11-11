export const formatGeoCities = (data: any) => {
  const filteredData = data.geonames
    .filter((city: any) => {
      return city.population > 0 && city.fclName === "city, village,...";
    })
    .sort((a: any, b: any) => {
      return b.population - a.population;
    });

  return filteredData.map((city: any) => {
    return {
      label: city.name,
      id: city.geonameId,
    };
  });
};
