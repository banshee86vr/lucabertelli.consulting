let text_animation = gsap.utils.toArray(".has_text_move_anim");
text_animation.forEach((t) => {
  var a = 0.5;
  t.getAttribute("data-delay") && (a = t.getAttribute("data-delay"));
  const e = gsap.timeline({
      scrollTrigger: {
        trigger: t,
        start: "top 85%",
        duration: 1.5,
        scrub: !1,
        markers: !1,
        toggleActions: "play none none none",
      },
    }),
    r = new SplitText(t, { type: "lines" });
  gsap.set(t, { perspective: 400 }),
    r.split({ type: "lines" }),
    e.from(r.lines, {
      duration: 1,
      delay: a,
      opacity: 0,
      rotationX: -80,
      force3D: !0,
      transformOrigin: "top center -50",
      stagger: 0.1,
    });
});
var animation_char_come_items = document.querySelectorAll(".has_char_anim");
animation_char_come_items.forEach((t) => {
  var a = 0.05,
    e = 20,
    r = !1,
    o = 1,
    i = 0.5,
    s = "power2.out";
  if (
    (t.getAttribute("data-stagger") && (a = t.getAttribute("data-stagger")),
    t.getAttribute("data-translateX") &&
      (e = t.getAttribute("data-translateX")),
    t.getAttribute("data-translateY") &&
      (r = t.getAttribute("data-translateY")),
    t.getAttribute("data-on-scroll") && (o = t.getAttribute("data-on-scroll")),
    t.getAttribute("data-delay") && (i = t.getAttribute("data-delay")),
    t.getAttribute("data-ease") && (s = t.getAttribute("data-ease")),
    1 == o)
  ) {
    if (e > 0 && !r) {
      let r = new SplitText(t, { type: "chars, words" });
      gsap.from(r.chars, {
        duration: 1,
        delay: i,
        x: e,
        autoAlpha: 0,
        stagger: a,
        ease: s,
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    }
    if (r > 0 && !e) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.chars, {
        duration: 1,
        delay: i,
        y: r,
        autoAlpha: 0,
        ease: s,
        stagger: a,
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    }
    if (e && r) {
      let o = new SplitText(t, { type: "chars, words" });
      gsap.from(o.chars, {
        duration: 3,
        delay: i,
        y: r,
        x: e,
        autoAlpha: 0,
        ease: s,
        stagger: a,
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    }
    if (!e && !r) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.chars, {
        duration: 1,
        delay: i,
        x: 50,
        autoAlpha: 0,
        stagger: a,
        ease: s,
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    }
  } else {
    if (e > 0 && !r) {
      let r = new SplitText(t, { type: "chars, words" });
      gsap.from(r.chars, {
        duration: 1,
        delay: i,
        x: e,
        ease: s,
        autoAlpha: 0,
        stagger: a,
      });
    }
    if (r > 0 && !e) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.chars, {
        duration: 1,
        delay: i,
        y: r,
        autoAlpha: 0,
        ease: s,
        stagger: a,
      });
    }
    if (e && r) {
      let o = new SplitText(t, { type: "chars, words" });
      gsap.from(o.chars, {
        duration: 1,
        delay: i,
        y: r,
        x: e,
        ease: s,
        autoAlpha: 0,
        stagger: a,
      });
    }
    if (!e && !r) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.chars, {
        duration: 1,
        delay: i,
        ease: s,
        x: 50,
        autoAlpha: 0,
        stagger: a,
      });
    }
  }
});
let animation_word_anim_items = document.querySelectorAll(".has_word_anim");
animation_word_anim_items.forEach((t) => {
  var a = 0.05,
    e = !1,
    r = !1,
    o = 1,
    i = 0.5;
  if (
    (t.getAttribute("data-stagger") && (a = t.getAttribute("data-stagger")),
    t.getAttribute("data-translateX") &&
      (e = t.getAttribute("data-translateX")),
    t.getAttribute("data-translateY") &&
      (r = t.getAttribute("data-translateY")),
    t.getAttribute("data-on-scroll") && (o = t.getAttribute("data-on-scroll")),
    t.getAttribute("data-delay") && (i = t.getAttribute("data-delay")),
    1 == o)
  ) {
    if (e && !r) {
      let r = new SplitText(t, { type: "chars, words" });
      gsap.from(r.words, {
        duration: 1,
        x: e,
        autoAlpha: 0,
        stagger: a,
        delay: i,
        scrollTrigger: { trigger: t, start: "top 90%" },
      });
    }
    if (r && !e) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.words, {
        duration: 1,
        delay: i,
        y: r,
        autoAlpha: 0,
        stagger: a,
        scrollTrigger: { trigger: t, start: "top 90%" },
      });
    }
    if (r && e) {
      let o = new SplitText(t, { type: "chars, words" });
      gsap.from(o.words, {
        duration: 1,
        delay: i,
        x: e,
        y: r,
        autoAlpha: 0,
        stagger: a,
        scrollTrigger: { trigger: t, start: "top 90%" },
      });
    }
    if (!e && !r) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.words, {
        duration: 1,
        delay: i,
        x: 20,
        autoAlpha: 0,
        stagger: a,
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    }
  } else {
    if (e > 0 && !r) {
      let r = new SplitText(t, { type: "chars, words" });
      gsap.from(r.words, {
        duration: 1,
        delay: i,
        x: e,
        autoAlpha: 0,
        stagger: a,
      });
    }
    if (r > 0 && !e) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.words, {
        duration: 1,
        delay: i,
        y: r,
        autoAlpha: 0,
        stagger: a,
      });
    }
    if (r > 0 && e > 0) {
      let o = new SplitText(t, { type: "chars, words" });
      gsap.from(o.words, {
        duration: 1,
        delay: i,
        x: e,
        y: r,
        autoAlpha: 0,
        stagger: a,
      });
    }
    if (!e && !r) {
      let e = new SplitText(t, { type: "chars, words" });
      gsap.from(e.words, {
        duration: 1,
        delay: i,
        x: 20,
        autoAlpha: 0,
        stagger: a,
      });
    }
  }
});
const fadeArray = gsap.utils.toArray(".has_fade_anim");
fadeArray.forEach((t, a) => {
  var e = "bottom",
    r = 1,
    o = 1.5,
    i = 50,
    s = 0.5,
    g = "power2.out";
  t.getAttribute("data-fade-offset") &&
    (i = t.getAttribute("data-fade-offset")),
    t.getAttribute("data-duration") && (o = t.getAttribute("data-duration")),
    t.getAttribute("data-fade-from") && (e = t.getAttribute("data-fade-from")),
    t.getAttribute("data-on-scroll") && (r = t.getAttribute("data-on-scroll")),
    t.getAttribute("data-delay") && (s = t.getAttribute("data-delay")),
    t.getAttribute("data-ease") && (g = t.getAttribute("data-ease")),
    1 == r
      ? ("top" == e &&
          gsap.from(t, {
            y: -i,
            opacity: 0,
            ease: g,
            duration: o,
            delay: s,
            scrollTrigger: { trigger: t, start: "top 85%" },
          }),
        "left" == e &&
          gsap.from(t, {
            x: -i,
            opacity: 0,
            ease: g,
            duration: o,
            delay: s,
            scrollTrigger: { trigger: t, start: "top 85%" },
          }),
        "bottom" == e &&
          gsap.from(t, {
            y: i,
            opacity: 0,
            ease: g,
            duration: o,
            delay: s,
            scrollTrigger: { trigger: t, start: "top 85%" },
          }),
        "right" == e &&
          gsap.from(t, {
            x: i,
            opacity: 0,
            ease: g,
            duration: o,
            delay: s,
            scrollTrigger: { trigger: t, start: "top 85%" },
          }),
        "in" == e &&
          gsap.from(t, {
            opacity: 0,
            ease: g,
            duration: o,
            delay: s,
            scrollTrigger: { trigger: t, start: "top 85%" },
          }))
      : ("top" == e &&
          gsap.from(t, { y: -i, opacity: 0, ease: g, duration: o, delay: s }),
        "left" == e &&
          gsap.from(t, { x: -i, opacity: 0, ease: g, duration: o, delay: s }),
        "bottom" == e &&
          gsap.from(t, { y: i, opacity: 0, ease: g, duration: o, delay: s }),
        "right" == e &&
          gsap.from(t, { x: i, opacity: 0, ease: g, duration: o, delay: s }),
        "in" == e &&
          gsap.from(t, { opacity: 0, ease: g, duration: o, delay: s }));
});
const anim_reveal = document.querySelectorAll(".has_text_reveal_anim");
anim_reveal.forEach((t) => {
  var a = 1.5,
    e = 1,
    r = 0.02,
    o = 0.05;
  t.getAttribute("data-duration") && (a = t.getAttribute("data-duration")),
    t.getAttribute("data-on-scroll") && (e = t.getAttribute("data-on-scroll")),
    t.getAttribute("data-stagger") && (r = t.getAttribute("data-stagger")),
    t.getAttribute("data-delay") && (o = t.getAttribute("data-delay")),
    (t.split = new SplitText(t, {
      type: "lines,words,chars",
      linesClass: "anim-reveal-line",
    })),
    (t.anim =
      1 == e
        ? gsap.from(t.split.chars, {
            scrollTrigger: { trigger: t, start: "top 85%" },
            duration: a,
            delay: o,
            ease: "circ.out",
            y: 80,
            stagger: r,
            opacity: 0,
          })
        : gsap.from(t.split.chars, {
            duration: a,
            delay: o,
            ease: "circ.out",
            y: 80,
            stagger: r,
            opacity: 0,
          }));
});
let btn_cirle = gsap.utils.toArray(".btn-wrapper"),
  regular_buttons = gsap.utils.toArray(".has_btn_anim");
var all_buttons = btn_cirle.concat(regular_buttons);
all_buttons.forEach((t) => {
  t.classList.contains("hero__button") ||
    gsap.from(t, {
      scrollTrigger: { trigger: t, start: "top 85%", markers: !1 },
      opacity: 0,
      y: -70,
      ease: "bounce",
      duration: 1.5,
    });
});
let device_width = window.innerWidth,
  pd_btn_list = gsap.utils.toArray(".has_pdlist_btn_animation button");
gsap.set(pd_btn_list, { opacity: 0, x: 35 }),
  gsap.to(pd_btn_list, {
    scrollTrigger: { trigger: ".has_pdlist_btn_animation", start: "top 85%" },
    opacity: 1,
    x: 0,
    duration: 2,
    ease: "power4.out",
    stagger: 0.3,
    rotation: 0,
  });
let animation__feature2 = gsap.utils.toArray(
  ".has_pdportfolio_animation .pdesigner-portfolio__item"
);
device_width < 100
  ? animation__feature2.forEach((t, a) => {
      gsap.set(t, { opacity: 0, scale: 0.9 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top 85%" } })
          .to(t, { opacity: 1, scale: 10, duration: 1.5, ease: "bounce" });
    })
  : (gsap.set(".has_pdportfolio_animation .pdesigner-portfolio__item", {
      opacity: 0,
      scale: 1.15,
      rotation: 2,
    }),
    gsap.to(".has_pdportfolio_animation .pdesigner-portfolio__item", {
      scrollTrigger: {
        trigger: ".has_pdportfolio_animation .pdesigner-portfolio__item",
        start: "top center+=200",
      },
      opacity: 1,
      scale: 1,
      duration: 3,
      ease: "bounce",
      stagger: 0.5,
      rotation: 0,
    }));
let splitTextLines = gsap.utils.toArray(".text-anim p");
if (
  (splitTextLines.forEach((t) => {
    const a = gsap.timeline({
        scrollTrigger: {
          trigger: t,
          start: "top 85%",
          duration: 2,
          end: "bottom 60%",
          scrub: !1,
          markers: !1,
          toggleActions: "play none none none",
        },
      }),
      e = new SplitText(t, { type: "lines" });
    gsap.set(t, { perspective: 400 }),
      e.split({ type: "lines" }),
      a.from(e.lines, {
        duration: 1,
        delay: 0.5,
        opacity: 0,
        rotationX: -80,
        force3D: !0,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
  }),
  gsap.set(".brand__logo", { y: 30, opacity: 0 }),
  device_width < 1023)
) {
  gsap.utils.toArray(".brand__logo").forEach((t, a) => {
    gsap
      .timeline({ scrollTrigger: { trigger: t, start: "top 95%" } })
      .to(t, { y: 0, opacity: 1 });
  });
} else
  gsap.to(".brand__logo", {
    scrollTrigger: { trigger: ".brand__logo", start: "top 95%" },
    y: 0,
    opacity: 1,
    stagger: { each: 0.15 },
  });
gsap.from(".pdesigner-contact__area", {
  y: -500,
  scrollTrigger: {
    trigger: ".pdesigner-blog__area",
    start: "bottom bottom",
    scrub: !0,
  },
}),
  gsap.from(".footer__area-2", {
    y: -500,
    scrollTrigger: {
      trigger: ".pdesigner-blog__area",
      start: "bottom bottom",
      scrub: !0,
    },
  });
const split = new SplitText(".text_invert", { type: "lines" });
split.lines.forEach((t) => {
  gsap.to(t, {
    backgroundPositionX: 0,
    ease: "none",
    scrollTrigger: {
      trigger: t,
      scrub: 1,
      start: "top 85%",
      end: "bottom center",
    },
  });
});
try {
  let t = document.querySelectorAll(".scroll__image-wrap"),
    a = document.querySelectorAll(".scroll__image-inner");
  t.forEach((t, e) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: t,
          start: "top top+=90",
          pin: !0,
          markers: !1,
          scrub: 1,
          pinSpacing: !1,
          end: "bottom bottom+=150",
        },
      })
      .to(a[e], { width: "100%", borderRadius: "0px" });
  });
} catch (t) {
  console.log("Item Not found");
}
let fashion_blogs = gsap.utils.toArray(".dancer__blog-item");
device_width < 1023
  ? fashion_blogs.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".dancer__blog-item", { opacity: 0, y: 40 }),
    gsap.to(".dancer__blog-item", {
      scrollTrigger: {
        trigger: ".dancer__blog-item",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
let fade_items = gsap.utils.toArray(".has_fade_items_anim");
device_width < 1023
  ? fade_items.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".has_fade_items_anim", { opacity: 0, y: 40 }),
    gsap.to(".has_fade_items_anim", {
      scrollTrigger: {
        trigger: ".has_fade_items_anim",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
let product_items_fade_anim = gsap.utils.toArray(".product_items_fade_anim");
device_width < 1023
  ? fade_items.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".product_items_fade_anim", { opacity: 0, y: 40 }),
    gsap.to(".product_items_fade_anim", {
      scrollTrigger: {
        trigger: ".product_items_fade_anim",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
let jurnal_fade_animation = gsap.utils.toArray(".jurnal_fade_animation");
device_width < 1023
  ? fade_items.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".jurnal_fade_animation", { opacity: 0, y: 40 }),
    gsap.to(".jurnal_fade_animation", {
      scrollTrigger: {
        trigger: ".jurnal_fade_animation",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
let product_fade_animation = gsap.utils.toArray(".product_fade_animation");
device_width < 1023
  ? fade_items.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".product_fade_animation", { opacity: 0, y: 40 }),
    gsap.to(".product_fade_animation", {
      scrollTrigger: {
        trigger: ".product_fade_animation",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
let dev_blogs_animation = gsap.utils.toArray(".fade_dev_blog_items_anim");
device_width < 1023
  ? dev_blogs_animation.forEach((t, a) => {
      gsap.set(t, { opacity: 0, y: 60 }),
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top center+=200" } })
          .to(t, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    })
  : (gsap.set(".fade_dev_blog_items_anim", { opacity: 0, y: 40 }),
    gsap.to(".fade_dev_blog_items_anim", {
      scrollTrigger: {
        trigger: ".fade_dev_blog_items_anim",
        start: "top center+=200",
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2,
    }));
var icon_lists = gsap.utils.toArray(".animated_icon");
icon_lists.forEach((t) => {
  let a = t.getAttribute("data-animation");
  var e = 2,
    r = 1.5,
    o = -1;
  t.getAttribute("data-duration") && (e = t.getAttribute("data-duration")),
    t.getAttribute("data-scale") && (r = t.getAttribute("data-scale")),
    t.getAttribute("data-repeat") && (o = t.getAttribute("data-repeat")),
    "zoom" == a &&
      gsap.to(t, {
        scale: r,
        duration: e,
        repeat: o,
        yoyo: !0,
        ease: "power2.out",
      }),
    "rotate" == a &&
      gsap.to(t, {
        rotation: 350,
        duration: e,
        repeat: o,
        ease: Linear.easeNone,
      });
});
var artist_galarys = document.querySelectorAll(".artist__gallary"),
  counter = 0;
artist_galarys.forEach((t) => {
  gsap.to(t, {
    scrollTrigger: {
      trigger: t,
      pin: t,
      pinSpacing: !1,
      start: "top counter",
      delay: 1,
    },
  });
});
var photo_gallary = document.querySelectorAll(".img_anim_group_scale img");
gsap.set(".img_anim_group_scale img", { scale: 0.7 }),
  photo_gallary.forEach((t) => {
    gsap.to(t, {
      scrollTrigger: { trigger: t, start: "top 90%", scrub: !0 },
      scale: 1,
    });
  }),
  gsap.to(".intDesigner-hero__titlewrap", {
    scrollTrigger: {
      trigger: ".intDesigner-hero__area",
      pin: ".intDesigner-hero__titlewrap",
      pinSpacing: !1,
      start: "top top",
      end: "bottom 89",
      delay: 1,
      color: "#333",
    },
  });
var has_image_zoom = document.querySelectorAll(".has_image_zoom img");
has_image_zoom.forEach((t) => {
  gsap.to(t, {
    scrollTrigger: { trigger: t, start: "top top", scrub: !0 },
    scale: 1.15,
  });
});
