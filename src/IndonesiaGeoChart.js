import React, { useEffect, useState, useRef } from "react";
import { queue } from "d3-queue";
import * as scale from "d3-scale";
import * as topojson from "topojson";
import * as d3 from "d3";

import jsonDataIndonesia from "./IndonesiaData.json";

function IndonesiaGeoChart() {
  let width = 960,
    height = 500,
    centered;

  const [dataIndonesia, setDataIndonesia] = useState(null);

  const _readyFunction = (error, dataIndonesia) => {
    console.log("_readyFunction -> dataIndonesia", dataIndonesia);
    setDataIndonesia(dataIndonesia);
  };

  const _fetchingJsonData = () => {
    console.log("masuk sini");
    queue()
      .defer(
        d3.json,
        "http://bl.ocks.org/tvalentius/raw/066b055d4d55de3eb303dc9f3d210d76/bd8310d383d23a08d62e2b22d2daa834f21535d0/indonesia-topojson-city-regency.json"
      )
      //   .defer(
      //     d3.csv,
      //     "http://bl.ocks.org/tvalentius/raw/066b055d4d55de3eb303dc9f3d210d76/bd8310d383d23a08d62e2b22d2daa834f21535d0/ipm.csv",
      //     function(d) {
      //       ipm.set(d.nama_kabkota, Number(d.ipm / 10));
      //     }
      //   )
      .await(_readyFunction);
  };

  // _fetchingJsonData();

  let d3Container = useRef(null);

  let projection = d3
    .geoEquirectangular()
    .scale(1050)
    .rotate([-120, 0])
    .translate([width / 2, height / 2]);

  let path = d3.geoPath().projection(projection);

  let color = d3
    .scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeYlGnBu[9]);

  // let color = scale.category20();

  useEffect(() => {
    (async function fetchinData() {
      // const result = await fetch(
      //   "http://bl.ocks.org/tvalentius/raw/066b055d4d55de3eb303dc9f3d210d76/bd8310d383d23a08d62e2b22d2daa834f21535d0/indonesia-topojson-city-regency.json"
      // );
      // const jsonData = await result.json();
      // console.log("fetchinData -> result", jsonData);
      setDataIndonesia(jsonDataIndonesia);
    })();
  }, []);

  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    if (!isRendered && dataIndonesia) {
      console.log("IndonesiaGeoChart -> dataIndonesia", dataIndonesia);

      let svg = d3.select(d3Container.current);
      svg
        .append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", clicked);

      let g = svg.append("g");

      const data = dataIndonesia;

      g.append("g")
        .attr("id", "subunits")
        .selectAll("path")
        .data(topojson.feature(data, data.objects.IDN_adm_2_kabkota).features)
        .enter()
        .append("path")
        // .attr("fill", function(d) {
        //   console.log("IndonesiaGeoChart -> d", d);
        //   let key = d.properties.NAME_2;
        //   key = d.properties.VARNAME_2 ? d.properties.VARNAME_2 : key;
        //   // if (!ipm.get(key)) key = d.properties.NAME_2;
        //   // if (!ipm.get(key)) console.log(d.properties.VARNAME_2, key);

        //   // return color((d.ipm = ipm.get(key)));
        // })
        .attr("fill", function(d, i) {
          const rndNumber = Math.random() * (25 - 2) + 2;
          return color(rndNumber.toString());
        })
        .attr("d", path)
        .on("click", clicked);
      // .on("mouseover", (d, i) => alert(`hovered >>> ${d.properties.NAME_2}`));

      g.append("path")
        .datum(
          topojson.mesh(data, data.objects.IDN_adm_2_kabkota, function(a, b) {
            return a !== b;
          })
        )
        .attr("id", "state-borders")
        .attr("d", path);

      function clicked(d) {
        console.log("clicked -> d", d);
        var x, y, k;

        // if (d) {
        //   console.log(d.properties);
        //   document.getElementById("info-location").innerHTML = regionName(d);
        //   document.getElementById("info-details").innerHTML =
        //     "Human Development Index : " + getHDI(d);
        // } else {
        //   document.getElementById("info-location").innerHTML = "INDONESIA";
        //   document.getElementById("info-details").innerHTML =
        //     "Human Development Index (Average) : " + averageIPM;
        // }

        if (d && centered !== d) {
          var centroid = path.centroid(d);
          x = centroid[0];
          y = centroid[1];
          k = 4;
          centered = d;
        } else {
          x = width / 2;
          y = height / 2;
          k = 1;
          centered = null;
        }

        g.selectAll("path").classed(
          "active",
          centered &&
            function(d) {
              return d === centered;
            }
        );

        g.transition()
          .duration(750)
          .attr(
            "transform",
            "translate(" +
              width / 2 +
              "," +
              height / 2 +
              ")scale(" +
              k +
              ")translate(" +
              -x +
              "," +
              -y +
              ")"
          )
          .style("stroke-width", 1.5 / k + "px");
      }

      setIsRendered(true);
    }
  }, [color, dataIndonesia, isRendered, path]);

  return (
    <>
      <svg
        className="d3-component"
        width={width}
        height={height}
        ref={d3Container}
      />
    </>
  );
}

export default IndonesiaGeoChart;
