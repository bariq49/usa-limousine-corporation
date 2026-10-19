export function getGridConfig(borderColor: string) {
  return {
    borderColor,
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    padding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 10,
    },
  };
}

export function getXAxisConfig(labelColor: string) {
  return {
    labels: {
      style: {
        colors: labelColor,
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  };
}

export function getYAxisConfig(labelColor: string) {
  return {
    labels: {
      offsetX: -10,
      style: {
        colors: labelColor,
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
  };
}
