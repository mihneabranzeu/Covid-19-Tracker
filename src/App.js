import React, { useState, useEffect } from "react";
import {MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import './App.css';
import './util'
import { sortData, prettyPrintStat } from "./util";
import "leaflet/dist/leaflet.css";


function App() {
  //Create the countries array
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // Initial load with the worlwide info
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);

  //Populate the countries list and get the info
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country, //United States
            value: country.countryInfo.iso2 // USA, UK
          }));
        
        //Sort the data
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  //Handle the change regarding the dropdown
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = 
      countryCode === "worldwide" 
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      
      // All of the data from the country response
      setCountryInfo(data);

      setMapCenter(countryCode ==="worldwide" ? {lat: 34.80746, lng: -40.4796} : [data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(countryCode === "worldwide" ? 3 : 4);
    });
  };

  console.log("COUNTRY INFO >>>>", countryInfo);
  
  return (
    <div className="app">
      
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              {/* Loop through all the countries and show a dropdown list of all the options */}

              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                //Add the dropdown menu items
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }

            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === 'cases'} 
            onClick={e => setCasesType('cases')}
            title="Coronavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox 
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')} 
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>

      <Card className="app__right">
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData}/>
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType}/>
          </CardContent>
      </Card>    
    </div>
  );
}

export default App;
