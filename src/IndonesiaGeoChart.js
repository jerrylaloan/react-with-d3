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

  useEffect(() => {
    (async function fetchinData() {
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
