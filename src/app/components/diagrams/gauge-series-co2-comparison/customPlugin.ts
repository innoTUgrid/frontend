// Added support to display images in no-data-modules

export default function (Highcharts: any) {
    const H = Highcharts,
      { each, merge, pInt, pick, isNumber } = H;
  
    H.seriesTypes.gauge.prototype.translate = function () {
      var series = this,
        yAxis = series.yAxis,
        options = series.options,
        center = yAxis.center;
  
      series.generatePoints();
  
      each(series.points, function (point: any) {
        var dialOptions = merge(options.dial, point.dial),
          isTrianglePoint = point.series.userOptions.isTrianglePoint,
          size = pInt(pick(dialOptions.size, 3)),
          radius = (pInt(pick(dialOptions.radius, 80)) * center[2]) / 200,
          baseLength = (pInt(pick(dialOptions.baseLength, 70)) * radius) / 100,
          rearLength = (pInt(pick(dialOptions.rearLength, 10)) * radius) / 100,
          baseWidth = dialOptions.baseWidth || 3,
          topWidth = dialOptions.topWidth || 1,
          overshoot = options.overshoot,
          rotation =
            yAxis.startAngleRad +
            yAxis.translate(point.y, null, null, null, true);
  
        // Handle the wrap and overshoot options
        if (isNumber(overshoot)) {
          overshoot = (overshoot / 180) * Math.PI;
          rotation = Math.max(
            yAxis.startAngleRad - overshoot,
            Math.min(yAxis.endAngleRad + overshoot, rotation)
          );
        } else if (options.wrap === false) {
          rotation = Math.max(
            yAxis.startAngleRad,
            Math.min(yAxis.endAngleRad, rotation)
          );
        }
  
        rotation = (rotation * 180) / Math.PI;
  
        // Checking series to draw dots
        if (isTrianglePoint) {
          //draw new dial
          point.shapeType = 'path';
          point.shapeArgs = {
            d: dialOptions.path || [
              'M',
              -rearLength,
              baseWidth - 3,
              'L',
              -rearLength + 2 * size,
              baseWidth - 3 - size,
              -rearLength + 2 * size,
              baseWidth - 3 + size,
              'z',
            ],
            translateX: center[0],
            translateY: center[1],
            rotation: rotation,
            style: 'stroke: white; stroke-width: 2;',
          };
        } else {
          //draw standard dial
          point.shapeType = 'path';
          point.shapeArgs = {
            d: dialOptions.path || [
              'M',
              -rearLength,
              -baseWidth / 2,
              'L',
              baseLength,
              -baseWidth / 2,
              radius,
              -topWidth / 2,
              radius,
              topWidth / 2,
              baseLength,
              baseWidth / 2,
              -rearLength,
              baseWidth / 2,
              'z',
            ],
            translateX: center[0],
            translateY: center[1],
            rotation: rotation,
          };
        }
  
        // Positions for data label
        point.plotX = center[0];
        point.plotY = center[1];
      });
    }; // end of replaced function
  }
  