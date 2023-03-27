  import mount from "./icon.js"

  mount("#container", [
    {
      r: 36,
      width: 0.4,
      color: "rgba(95, 143, 181, 1)",
      dashArray: ["1%", "10.3%", "22%"],
      speed: 50
    },
    {
      r: 36,
      width: 0.4,
      color: "rgba(95, 143, 181, 0.3)",
      dashArray: ["20%", "12%"],
      speed: 50
    },
    {
      r: 31,
      width: 1,
      color: "rgba(120, 175, 159, 1)",
      dashArray: ["1%", "12.3%", "15.3%"],
      speed: 50
    },
    {
      r: 31,
      width: 1,
      color: "rgba(120, 175, 159, 0.3)",
      offset: "-8",
      dashArray: ["1%", "14%", "15%", "5%", "6%"],
      speed: 50
    },
    {
      r: 28.9,
      width: 1.5,
      color: "rgba(198, 139, 34, 1)",
      dashArray: ["1%", "8%", "20%"],
      speed: 40
    },
    {
      r: 28.9,
      width: 1.5,
      color: "rgba(198, 139, 34, 0.3)",
      offset: "15",
      dashArray: ["1%", "20%", "5%"],
      speed: 40
    },
    {
      r: 27,
      width: 1,
      color: "rgba(193, 93, 15, 1)",
      dashArray: ["1%", "13%", "5%"],
      speed: 37
    },
    {
      r: 27,
      width: 1,
      color: "rgba(193, 93, 5, 0.3)",
      dashArray: [ "14%", "15%"],
      offset: "-6",
      speed: 37
    },
    {
      r: 25,
      width: 0.6,
      color: "rgb(170,52,9)",
      dashArray: ["2%", "8%", "0.4%"],
      speed: 30
    },
    {
      r: 25,
      width: 0.6,
      color: "rgba(170,52,9,0.3)",
      dashArray: ["15%"],
      offset: "8",
      speed: 28
    },
  ])
