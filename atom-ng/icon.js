export default function mount(selector, circles) {
  const svgNS = "http://www.w3.org/2000/svg"
  const content = document.querySelector(selector)

  const svg = document.createElementNS(svgNS, "svg")
  svg.setAttribute("viewBox", "0 0 100 100")
  content.innerHTML = ""

  const group = document.createElementNS(svgNS, "g")
  group.style.transformOrigin = "center"
  const animationTransform = document.createElementNS(svgNS, "animateTransform")
  animationTransform.setAttribute("attributeName", "transform");
  animationTransform.setAttribute("attributeType", "XML")
  animationTransform.setAttribute("type", "rotate")
  animationTransform.setAttribute("to", "360")
  animationTransform.setAttribute("repeatCount", "indefinite")

  circles.forEach(circle => {
    const _group = group.cloneNode(true)
    const _animationTransform = animationTransform.cloneNode(true)
    const child = document.createElementNS(svgNS, 'circle')
    child.setAttribute("cx", "50")
    child.setAttribute("cy", "50")
    child.setAttribute("r", circle.r)
    child.setAttribute("fill", "#ffffff00")
    child.setAttribute("stroke-width", circle.width)
    child.setAttribute("stroke-dasharray", (circle.dashArray || [10, 25]).join(","))
    child.setAttribute("stroke", circle.color)

    _animationTransform.setAttribute("from", circle.offset || "0")
    if (circle.speed) _animationTransform.setAttribute("dur", circle.speed + "s")
    _group.appendChild(child)
    _group.appendChild(_animationTransform)
    svg.appendChild(_group)
  })

  content.appendChild(svg)
}
