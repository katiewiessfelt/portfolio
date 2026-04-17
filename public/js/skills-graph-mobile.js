am5.ready(function () {
  // Root
  const root = am5.Root.new("chartdiv-mobile");
  root.setThemes([am5themes_Animated.new(root)]);

  let activeNode = null;

  // Container
  const container = root.container.children.push(
    am5.Container.new(root, {
      width: am5.percent(100),
      height: am5.percent(100),
      layout: root.verticalLayout,
    }),
  );

  // Pack
  var series = container.children.push(
    am5hierarchy.Pack.new(root, {
      downDepth: 1,
      initialDepth: 1,
      valueField: "value",
      categoryField: "name",
      childDataField: "children",
      colors: am5.ColorSet.new(root, {
        colors: [
          am5.color(0x00ffff),
          am5.color(0xff7700),
          am5.color(0xffff00),
          am5.color(0x00ff00),
          am5.color(0x8a2be2),
          am5.color(0x0000ff),
          am5.color(0xff00ff),
        ],
      }),
    }),
  );

  container.children.unshift(
    am5hierarchy.BreadcrumbBar.new(root, {
      series: series,
    }),
  );

  series.circles.template.setAll({
    fillOpacity: 1,
  });
  // -------------------------
  // BASIC STYLING
  // -------------------------
  series.circles.template.setAll({
    stroke: am5.color(0x000000), // border color
    strokeWidth: 2,
    strokeOpacity: 1,
  });

  series.labels.template.setAll({
    fill: am5.color(0x000000),
  });

  // Hide label for image nodes
  series.labels.template.adapters.add("text", (text, target) => {
    const data = target.dataItem?.dataContext;
    return data?.image ? "" : text;
  });

  // Cursor pointer
  series.nodes.template.setAll({
    cursorOverStyle: "pointer",
  });

  // -------------------------
  // ICONS
  // -------------------------

  series.circles.template.adapters.add("fill", (fill, target) => {
  const di = target.dataItem;
  if (!di) return fill;

  const data = di.dataContext;

  // if node has an icon → black background
  if (data?.image) {
    return am5.color(0x000000);
  }

  return fill;
});

  series.nodes.template.setup = function (target) {
    target.events.on("dataitemchanged", function (ev) {
      const data = ev.target.dataItem.dataContext;

      if (data?.image) {
        target.children.clear();

        target.children.push(
          am5.Picture.new(root, {
            width: 70,
            height: 70,
            src: data.image,
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            x: am5.percent(50),
            y: am5.percent(50),
          }),
        );
      }
    });
  };

  series.nodes.template.events.on("click", (ev) => {
    const di = ev.target.dataItem;
    if (!di) return;

    const data = di.dataContext;
    if (data?.image && data?.experience) {
      openModal(data);
    }
  });

  function openModal(data) {
    const modal = document.getElementById("modal");
    const title = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");

    title.textContent = data.name;

    let html = "";

    if (data.experience) {
      data.experience.forEach((record) => {
        const years =
          record.years === 1
            ? ` (${record.years} yr)`
            : record.years
              ? ` (${record.years} yrs)`
              : "";

        if (record.link) {
          html += `<div><a href="${record.link}">${record.label}${years}</a></div>`;
        } else {
          html += `<div>${record.label}${years}</div>`;
        }
      });
    }

    body.innerHTML = html;
    modal.classList.remove("hidden");
  }

  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });

  // -------------------------
  // TOOL-TIPS
  // -------------------------

  series.set("tooltip", null);

  series.nodes.template.setAll({
    tooltip: null,
    tooltipText: "",
  });

  series.circles.template.setAll({
    tooltip: null,
    tooltipText: "",
  });

  // -------------------------
  // DATA LOAD
  // -------------------------

  fetch("/api/skills-graph")
    .then((res) => res.json())
    .then((data) => {
      series.data.setAll([data]);
      series.set("selectedDataItem", series.dataItems[0]);
    })
    .catch((err) => {
      console.error("Failed to load graph data:", err);
    });
});
