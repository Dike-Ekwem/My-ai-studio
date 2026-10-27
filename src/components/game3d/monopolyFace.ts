import * as THREE from 'three';

export type MonopolyVariant = 
  | 'papa' 
  | 'mama' 
  | 'student' 
  | 'student_boy_fade'
  | 'student_boy_afro'
  | 'student_boy_dreads'
  | 'student_girl_braids'
  | 'student_girl_afro_puff'
  | 'student_girl_hijab'
  | 'student_girl_gele'
  | 'student_beanie'
  | 'npc_handlebar' 
  | 'npc_walrus' 
  | 'npc_pencil' 
  | 'npc_goatee' 
  | 'npc_monocle' 
  | 'npc_sunglasses';

/**
 * Creates a stylized 3D Monopoly Guy face with 3D facial features,
 * expressive cartoon eyes, button nose, rosy cheeks, and diverse Nigerian student hairstyles & cultural headwear.
 */
export function createMonopolyHead(variant: MonopolyVariant | string, customSkinColor?: string): THREE.Group {
  const headGroup = new THREE.Group();

  const isFemale =
    variant === 'mama' ||
    variant === 'student_girl_braids' ||
    variant === 'student_girl_afro_puff' ||
    variant === 'student_girl_hijab' ||
    variant === 'student_girl_gele';

  // 1. Head Base Sphere
  const skinColor = customSkinColor || (variant === 'papa' 
    ? '#6d4c41' 
    : isFemale
    ? '#795548' 
    : variant === 'student' 
    ? '#5d4037' 
    : variant === 'npc_walrus' 
    ? '#4e342e' 
    : '#6d4c41');

  const headGeo = new THREE.SphereGeometry(0.38, 20, 20);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.castShadow = true;
  headGroup.add(head);

  // 2. Rosy Cheeks
  const cheekMat = new THREE.MeshLambertMaterial({ color: '#dc7d68', transparent: true, opacity: 0.65 });
  const cheekGeo = new THREE.SphereGeometry(0.09, 12, 12);

  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.25, -0.04, 0.28);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.position.set(0.25, -0.04, 0.28);
  headGroup.add(cheekR);

  // 3. Cute Button Nose
  const noseMat = new THREE.MeshLambertMaterial({ color: '#4e342e' });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), noseMat);
  nose.position.set(0, 0.02, 0.38);
  headGroup.add(nose);

  // 4. Expressive Eyes
  const scleraMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const pupilMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });

  [-0.14, 0.14].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), scleraMat);
    eyeWhite.scale.set(1, 1.25, 0.5);
    eyeWhite.position.set(ex, 0.12, 0.33);
    headGroup.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), pupilMat);
    pupil.position.set(ex * 0.95, 0.12, 0.37);
    headGroup.add(pupil);

    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), scleraMat);
    sparkle.position.set(ex * 0.95 + 0.02, 0.14, 0.4);
    headGroup.add(sparkle);

    // Eyelashes for female characters
    if (isFemale) {
      const lashMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), lashMat);
      lash.position.set(ex, 0.2, 0.36);
      lash.rotation.z = ex > 0 ? -0.2 : 0.2;
      headGroup.add(lash);
    }

    // Brows
    const browMat = new THREE.MeshLambertMaterial({ 
      color: variant === 'papa' || variant === 'npc_walrus' ? '#e2e8f0' : '#1e1b4b' 
    });
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.035, 0.04), browMat);
    brow.position.set(ex, 0.23, 0.33);
    brow.rotation.z = ex > 0 ? -0.15 : 0.15;
    headGroup.add(brow);
  });

  // 5. Eyewear (Monocle or Shades)
  if (variant === 'npc_monocle' || variant === 'papa') {
    const monocleGeo = new THREE.TorusGeometry(0.1, 0.015, 8, 16);
    const monocleMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
    const monocle = new THREE.Mesh(monocleGeo, monocleMat);
    monocle.position.set(0.14, 0.12, 0.37);
    headGroup.add(monocle);
  } else if (variant === 'npc_sunglasses') {
    const shadesMat = new THREE.MeshLambertMaterial({ color: '#09090b' });
    const shadesBar = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.1), shadesMat);
    shadesBar.position.set(0, 0.14, 0.36);
    headGroup.add(shadesBar);

    [-0.14, 0.14].forEach((sx) => {
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.05), shadesMat);
      lens.position.set(sx, 0.11, 0.38);
      headGroup.add(lens);
    });
  }

  // 6. Mouth / Moustache Area
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.1, 0.35);

  const stacheColor = variant === 'papa' || variant === 'npc_walrus' 
    ? '#f8fafc' 
    : '#171717';
  const stacheMat = new THREE.MeshLambertMaterial({ color: stacheColor });

  if (isFemale) {
    // Charming ruby red smile
    const lips = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.03, 8, 16, Math.PI),
      new THREE.MeshLambertMaterial({ color: '#be123c' })
    );
    lips.rotation.z = Math.PI;
    lips.position.set(0, 0, 0.02);
    mouthGroup.add(lips);

    // Golden Hoop Earrings
    const earringMat = new THREE.MeshLambertMaterial({ color: '#fbbf24' });
    [-0.39, 0.39].forEach((ex) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), earringMat);
      ring.position.set(ex, 0, 0);
      ring.rotation.y = Math.PI / 2;
      headGroup.add(ring);
    });
  } else if (variant === 'npc_pencil' || variant === 'student_boy_fade') {
    const stacheL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.05), stacheMat);
    stacheL.position.set(-0.1, 0, 0);
    stacheL.rotation.z = 0.08;
    mouthGroup.add(stacheL);

    const stacheR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.05), stacheMat);
    stacheR.position.set(0.1, 0, 0);
    stacheR.rotation.z = -0.08;
    mouthGroup.add(stacheR);
  } else if (variant === 'npc_walrus') {
    const walrus = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.16, 12), stacheMat);
    walrus.rotation.x = Math.PI / 2;
    walrus.scale.set(1.4, 0.5, 0.9);
    mouthGroup.add(walrus);
  } else {
    // Classic Monopoly Handlebar
    const wingGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.24, 12);
    const wingL = new THREE.Mesh(wingGeo, stacheMat);
    wingL.rotation.z = Math.PI / 2.6;
    wingL.position.set(-0.12, 0, 0);
    mouthGroup.add(wingL);

    const tipL = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.03, 8, 12, Math.PI / 1.3), stacheMat);
    tipL.rotation.z = -Math.PI / 1.5;
    tipL.position.set(-0.25, 0.05, 0);
    mouthGroup.add(tipL);

    const wingR = new THREE.Mesh(wingGeo, stacheMat);
    wingR.rotation.z = -Math.PI / 2.6;
    wingR.position.set(0.12, 0, 0);
    mouthGroup.add(wingR);

    const tipR = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.03, 8, 12, Math.PI / 1.3), stacheMat);
    tipR.rotation.z = Math.PI / 1.5;
    tipR.position.set(0.25, 0.05, 0);
    mouthGroup.add(tipR);

    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), stacheMat);
    knot.position.set(0, 0.01, 0.02);
    mouthGroup.add(knot);

    if (variant === 'npc_goatee') {
      const chinTuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), stacheMat);
      chinTuft.rotation.x = Math.PI;
      chinTuft.position.set(0, -0.16, -0.02);
      mouthGroup.add(chinTuft);
    }
  }

  headGroup.add(mouthGroup);

  // 7. HAIRSTYLES & HEADWEAR
  const hairMat = new THREE.MeshLambertMaterial({ color: '#171717' });

  if (variant === 'papa') {
    // Red traditional Chief's cap with feather
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.36, 0.36, 18),
      new THREE.MeshLambertMaterial({ color: '#b91c1c' })
    );
    cap.position.y = 0.42;
    headGroup.add(cap);

    const feather = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.01, 0.55, 6),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    feather.rotation.z = 0.35;
    feather.position.set(0.3, 0.65, 0);
    headGroup.add(feather);
  } else if (variant === 'mama' || variant === 'student_girl_gele') {
    // Regal pleated golden Gele
    const geleMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const gele1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.18, 10, 20), geleMat);
    gele1.rotation.x = Math.PI / 2;
    gele1.position.y = 0.36;
    headGroup.add(gele1);

    const gele2 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.16, 10, 20), geleMat);
    gele2.rotation.x = Math.PI / 2 + 0.2;
    gele2.position.y = 0.48;
    headGroup.add(gele2);
  } else if (variant === 'student_girl_hijab') {
    // Elegant flowing Hijab
    const hijabMat = new THREE.MeshLambertMaterial({ color: '#0284c7' });
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 18), hijabMat);
    hood.position.set(0, 0.08, -0.04);
    headGroup.add(hood);

    const drapery = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 0.55, 16), hijabMat);
    drapery.position.set(0, -0.22, 0);
    headGroup.add(drapery);
  } else if (variant === 'student_girl_braids') {
    // Braided hair with beads
    const braidBase = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), hairMat);
    braidBase.position.set(0, 0.15, -0.05);
    headGroup.add(braidBase);

    for (let b = -0.3; b <= 0.3; b += 0.15) {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), hairMat);
      strand.position.set(b, -0.15, -0.25);
      headGroup.add(strand);

      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshLambertMaterial({ color: '#fbbf24' }));
      bead.position.set(b, -0.45, -0.25);
      headGroup.add(bead);
    }
  } else if (variant === 'student_girl_afro_puff') {
    // Big twin afro puffs
    [-0.32, 0.32].forEach((px) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), hairMat);
      puff.position.set(px, 0.4, 0);
      headGroup.add(puff);
    });
  } else if (variant === 'student_boy_afro') {
    // Classic round afro
    const afro = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), hairMat);
    afro.position.set(0, 0.18, -0.05);
    headGroup.add(afro);
  } else if (variant === 'student_boy_dreads') {
    // Dreads with gold rings
    const dreadBase = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 14), hairMat);
    dreadBase.position.set(0, 0.16, -0.02);
    headGroup.add(dreadBase);

    for (let d = -0.32; d <= 0.32; d += 0.14) {
      const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), hairMat);
      lock.position.set(d, 0.05, -0.2);
      headGroup.add(lock);
    }
  } else if (variant === 'student_beanie') {
    // Streetwear knitted beanie
    const beanieMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });
    const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7), beanieMat);
    beanie.position.y = 0.16;
    headGroup.add(beanie);
  } else if (variant === 'student') {
    // Mortarboard graduation cap
    const skullCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.36, 0.14, 16),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    skullCap.position.y = 0.38;
    headGroup.add(skullCap);

    const capTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.06, 0.85),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    capTop.position.y = 0.46;
    headGroup.add(capTop);

    const button = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
    button.position.y = 0.5;
    headGroup.add(button);

    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.32, 6), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
    tassel.rotation.z = 0.4;
    tassel.position.set(0.28, 0.34, 0.2);
    headGroup.add(tassel);
  } else {
    // Fresh low fade / cap
    const capColor = variant === 'npc_walrus' ? '#064e3b' : variant === 'npc_pencil' ? '#7c2d12' : '#1e3a8a';
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.37, 0.18, 16),
      new THREE.MeshLambertMaterial({ color: capColor })
    );
    cap.position.y = 0.38;
    headGroup.add(cap);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.2), new THREE.MeshLambertMaterial({ color: capColor }));
    visor.position.set(0, 0.32, 0.38);
    headGroup.add(visor);
  }

  return headGroup;
}
