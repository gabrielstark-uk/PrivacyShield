import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface FrequencyDisplayProps {
  data: Uint8Array | null;
  sampleRate?: number | null;
}

export function FrequencyDisplay({ data, sampleRate = 48000 }: FrequencyDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    // Calculate frequency for each bin
    const binCount = data.length;
    const frequencies = Array.from(data).map((value, i) => ({
      frequency: (i * (sampleRate || 192000)) / (2 * binCount),
      amplitude: value
    }));

    // Filter different frequency ranges
    // Only include frequencies that are within the audible and near-ultrasonic range
    const sonicWaves = frequencies.filter(f => f.frequency >= 20 && f.frequency <= 20000);

    // Note: Real microwave frequencies (300MHz-3GHz) cannot be captured by standard audio equipment
    // This is just for visualization purposes in the demo
    const highFrequencyRange = frequencies.filter(f => f.frequency >= 15000 && f.frequency <= 20000);

    const x = d3.scaleLog()
      .domain([20, sampleRate! / 2])
      .range([0, width])
      .clamp(true);

    const y = d3.scaleLinear()
      .domain([0, 255])
      .range([height - 30, 0]);

    // Create the line generator
    const line = d3.line<{frequency: number, amplitude: number}>()
      .x((d: { frequency: number; amplitude: number }) => x(d.frequency))
      .y((d: { frequency: number; amplitude: number }) => y(d.amplitude))
      .curve(d3.curveMonotoneX);

    // Add the frequency line
    svg.append("path")
      .datum(sonicWaves)
      .attr("class", "frequency-line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2);

    // Add high frequency line if detected (simulating V2K for demo)
    if (highFrequencyRange.length > 0) {
      svg.append("path")
        .datum(highFrequencyRange)
        .attr("class", "high-frequency-line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "hsl(var(--destructive))")
        .attr("stroke-width", 2);
    }

    // Add frequency ranges markers
    const ranges = [
      { min: 2000, max: 10000, label: "Sound Cannon Range" },
      { min: 15000, max: 20000, label: "High Frequency Range (V2K Simulation)" }
    ];

    // Add frequency axis with ranges - limit to audible and near-ultrasonic range
    const xAxis = d3.axisBottom(x)
      .tickValues([20, 100, 1000, 10000, 20000])
      .tickFormat((d: d3.NumberValue) => {
        const freq = Number(d.valueOf());
        if (freq >= 1000) return `${freq/1000}kHz`;
        return `${freq}Hz`;
      });

    svg.append("g")
      .attr("transform", `translate(0,${height - 20})`)
      .call(xAxis)
      .style("font-size", "10px");

    // Add range indicators
    ranges.forEach((range, i) => {
      if (x(range.min) && x(range.max)) {
        svg.append("rect")
          .attr("x", x(range.min))
          .attr("y", height - 30)
          .attr("width", x(range.max) - x(range.min))
          .attr("height", 4)
          .attr("fill", `hsl(${i * 50}, 70%, 50%)`)
          .attr("opacity", 0.3);
      }
    });

  }, [data, sampleRate]);

  return (
    <div className="w-full h-64 bg-card p-4">
      <div className="h-48"> {/* Fixed height container for the SVG */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          preserveAspectRatio="none"
        />
      </div>
      <div className="text-sm text-muted-foreground mt-2 text-center">
        Frequency Spectrum Analysis (20Hz - 20kHz)
      </div>
    </div>
  );
}