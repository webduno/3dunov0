import * as THREE from 'three';

let THREE_OBJLoader = function(manager) {
  this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
  this.materials = null;
  this.regexp = {
    vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
    face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
    face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
    face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
    object_pattern: /^[og]\s*(.+)?/,
    smoothing_pattern: /^s\s+(\d+|on|off)/,
    material_library_pattern: /^mtllib /,
    material_use_pattern: /^usemtl /
  };
};

THREE_OBJLoader.prototype = {
  constructor: THREE_OBJLoader,
  load: function(url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(this.path);
    loader.load(url, function(text) {
      onLoad(scope.parse(text));
      
    }, onProgress, onError);
  },
  setPath: function(value) {
    this.path = value;
  },
  setMaterials: function(materials) {
    this.materials = materials;
  },
  _createParserState: function() {
    var state = {
      objects: [],
      object: {},
      vertices: [],
      normals: [],
      uvs: [],
      materialLibraries: [],
      startObject: function(name, fromDeclaration) {
        if (this.object && this.object.fromDeclaration === false) {
          this.object.name = name;
          this.object.fromDeclaration = (fromDeclaration !== false);
          return;
        }
        if (this.object && typeof this.object._finalize === 'function') {
          this.object._finalize();
        }
        var previousMaterial = (this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined);
        this.object = {
          name: name || '',
          fromDeclaration: (fromDeclaration !== false),
          geometry: {
            vertices: [],
            normals: [],
            uvs: []
          },
          materials: [],
          smooth: true,
          startMaterial: function(name, libraries) {
            var previous = this._finalize(false);
            if (previous && (previous.inherited || previous.groupCount <= 0)) {
              this.materials.splice(previous.index, 1);
            }
            var material = {
              index: this.materials.length,
              name: name || '',
              mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
              smooth: (previous !== undefined ? previous.smooth : this.smooth),
              groupStart: (previous !== undefined ? previous.groupEnd : 0),
              groupEnd: -1,
              groupCount: -1,
              inherited: false,
              clone: function(index) {
                return {
                  index: (typeof index === 'number' ? index : this.index),
                  name: this.name,
                  mtllib: this.mtllib,
                  smooth: this.smooth,
                  groupStart: this.groupEnd,
                  groupEnd: -1,
                  groupCount: -1,
                  inherited: false
                };
              }
            };
            this.materials.push(material);
            return material;
          },
          currentMaterial: function() {
            if (this.materials.length > 0) {
              return this.materials[this.materials.length - 1];
            }
            return undefined;
          },
          _finalize: function(end) {
            var lastMultiMaterial = this.currentMaterial();
            if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {
              lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
              lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
              lastMultiMaterial.inherited = false;
            }
            if (end !== false && this.materials.length === 0) {
              this.materials.push({
                name: '',
                smooth: this.smooth
              });
            }
            return lastMultiMaterial;
          }
        };
        if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === "function") {
          var declared = previousMaterial.clone(0);
          declared.inherited = true;
          this.object.materials.push(declared);
        }
        this.objects.push(this.object);
      },
      finalize: function() {
        if (this.object && typeof this.object._finalize === 'function') {
          this.object._finalize();
        }
      },
      parseVertexIndex: function(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
      },
      parseNormalIndex: function(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
      },
      parseUVIndex: function(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;
      },
      addVertex: function(a, b, c) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0]);
        dst.push(src[a + 1]);
        dst.push(src[a + 2]);
        dst.push(src[b + 0]);
        dst.push(src[b + 1]);
        dst.push(src[b + 2]);
        dst.push(src[c + 0]);
        dst.push(src[c + 1]);
        dst.push(src[c + 2]);
      },
      addVertexLine: function(a) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0]);
        dst.push(src[a + 1]);
        dst.push(src[a + 2]);
      },
      addNormal: function(a, b, c) {
        var src = this.normals;
        var dst = this.object.geometry.normals;
        dst.push(src[a + 0]);
        dst.push(src[a + 1]);
        dst.push(src[a + 2]);
        dst.push(src[b + 0]);
        dst.push(src[b + 1]);
        dst.push(src[b + 2]);
        dst.push(src[c + 0]);
        dst.push(src[c + 1]);
        dst.push(src[c + 2]);
      },
      addUV: function(a, b, c) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0]);
        dst.push(src[a + 1]);
        dst.push(src[b + 0]);
        dst.push(src[b + 1]);
        dst.push(src[c + 0]);
        dst.push(src[c + 1]);
      },
      addUVLine: function(a) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0]);
        dst.push(src[a + 1]);
      },
      addFace: function(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
        var vLen = this.vertices.length;
        var ia = this.parseVertexIndex(a, vLen);
        var ib = this.parseVertexIndex(b, vLen);
        var ic = this.parseVertexIndex(c, vLen);
        var id;
        if (d === undefined) {
          this.addVertex(ia, ib, ic);
        } else {
          id = this.parseVertexIndex(d, vLen);
          this.addVertex(ia, ib, id);
          this.addVertex(ib, ic, id);
        }
        if (ua !== undefined) {
          var uvLen = this.uvs.length;
          ia = this.parseUVIndex(ua, uvLen);
          ib = this.parseUVIndex(ub, uvLen);
          ic = this.parseUVIndex(uc, uvLen);
          if (d === undefined) {
            this.addUV(ia, ib, ic);
          } else {
            id = this.parseUVIndex(ud, uvLen);
            this.addUV(ia, ib, id);
            this.addUV(ib, ic, id);
          }
        }
        if (na !== undefined) {
          var nLen = this.normals.length;
          ia = this.parseNormalIndex(na, nLen);
          ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
          ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);
          if (d === undefined) {
            this.addNormal(ia, ib, ic);
          } else {
            id = this.parseNormalIndex(nd, nLen);
            this.addNormal(ia, ib, id);
            this.addNormal(ib, ic, id);
          }
        }
      },
      addLineGeometry: function(vertices, uvs) {
        this.object.geometry.type = 'Line';
        var vLen = this.vertices.length;
        var uvLen = this.uvs.length;
        for (var vi = 0, l = vertices.length; vi < l; vi++) {
          this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
        }
        for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {
          this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
        }
      }
      
    };
    state.startObject('', false);
    return state;
  },
  parse: function(text) {
    var state = this._createParserState();
    if (text.indexOf('\r\n') !== -1) {
      text = text.replace('\r\n', '\n');
      
    }
    var lines = text.split('\n');
    var line = '',
    lineFirstChar = '',
    lineSecondChar = '';
    var lineLength = 0;
    var result = [];
    var trimLeft = (typeof ''.trimLeft === 'function');
    for (var i = 0, l = lines.length; i < l; i++) {
      line = lines[i];
      line = trimLeft ? line.trimLeft() : line.trim();
      lineLength = line.length;
      if (lineLength === 0) continue;
      lineFirstChar = line.charAt(0);
      if (lineFirstChar === '#') continue;
      if (lineFirstChar === 'v') {
        lineSecondChar = line.charAt(1);
        if (lineSecondChar === ' ' && (result = this.regexp.vertex_pattern.exec(line)) !== null) {
          state.vertices.push(
            parseFloat(result[1]),
            parseFloat(result[2]),
            parseFloat(result[3]));
        } else if (lineSecondChar === 'n' && (result = this.regexp.normal_pattern.exec(line)) !== null) {
          state.normals.push(
            parseFloat(result[1]),
            parseFloat(result[2]),
            parseFloat(result[3]));
        } else if (lineSecondChar === 't' && (result = this.regexp.uv_pattern.exec(line)) !== null) {
          state.uvs.push(
            parseFloat(result[1]),
            parseFloat(result[2]));
        } else {
          throw new Error("Unexpected vertex/normal/uv line: '" + line + "'");
        }
      } else if (lineFirstChar === "f") {
        if ((result = this.regexp.face_vertex_uv_normal.exec(line)) !== null) {
          state.addFace(
            result[1], result[4], result[7], result[10],
            result[2], result[5], result[8], result[11],
            result[3], result[6], result[9], result[12]);
        } else if ((result = this.regexp.face_vertex_uv.exec(line)) !== null) {
          state.addFace(
            result[1], result[3], result[5], result[7],
            result[2], result[4], result[6], result[8]);
        } else if ((result = this.regexp.face_vertex_normal.exec(line)) !== null) {
          state.addFace(
            result[1], result[3], result[5], result[7],
            undefined, undefined, undefined, undefined,
            result[2], result[4], result[6], result[8]);
        } else if ((result = this.regexp.face_vertex.exec(line)) !== null) {
          state.addFace(
            result[1], result[2], result[3], result[4]);
        } else {
          throw new Error("Unexpected face line: '" + line + "'");
        }
      } else if (lineFirstChar === "l") {
        var lineParts = line.substring(1).trim().split(" ");
        var lineVertices = [],
        lineUVs = [];
        if (line.indexOf("/") === -1) {
          lineVertices = lineParts;
        } else {
          for (var li = 0, llen = lineParts.length; li < llen; li++) {
            var parts = lineParts[li].split("/");
            if (parts[0] !== "") lineVertices.push(parts[0]);
            if (parts[1] !== "") lineUVs.push(parts[1]);
          }
        }
        state.addLineGeometry(lineVertices, lineUVs);
      } else if ((result = this.regexp.object_pattern.exec(line)) !== null) {
        var name = result[0].substr(1).trim();
        state.startObject(name);
      } else if (this.regexp.material_use_pattern.test(line)) {
        state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
      } else if (this.regexp.material_library_pattern.test(line)) {
        state.materialLibraries.push(line.substring(7).trim());
      } else if ((result = this.regexp.smoothing_pattern.exec(line)) !== null) {
        var value = result[1].trim().toLowerCase();
        state.object.smooth = (value === '1' || value === 'on');
        var material = state.object.currentMaterial();
        if (material) {
          material.smooth = state.object.smooth;
        }
      } else {
        if (line === '\0') continue;
        throw new Error("Unexpected line: '" + line + "'");
      }
    }
    state.finalize();
    var container = new THREE.Group();
    container.materialLibraries = [].concat(state.materialLibraries);
    for (var i = 0, l = state.objects.length; i < l; i++) {
      var object = state.objects[i];
      var geometry = object.geometry;
      var materials = object.materials;
      var isLine = (geometry.type === 'Line');
      if (geometry.vertices.length === 0) continue;
      var buffergeometry = new THREE.BufferGeometry();
      buffergeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));
      if (geometry.normals.length > 0) {
        buffergeometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
      } else {
        buffergeometry.computeVertexNormals();
      }
      if (geometry.uvs.length > 0) {
        buffergeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
      }
      var createdMaterials = [];
      for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
        var sourceMaterial = materials[mi];
        var material = undefined;
        if (this.materials !== null) {
          material = this.materials.create(sourceMaterial.name);
          if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {
            var materialLine = new THREE.LineBasicMaterial();
            materialLine.copy(material);
            material = materialLine;
          }
        }
        if (!material) {
          material = (!isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial());
          material.name = sourceMaterial.name;
        }
        material.flatShading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;
        createdMaterials.push(material);
      }
      var mesh;
      if (createdMaterials.length > 1) {
        for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
          var sourceMaterial = materials[mi];
          buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
        }
        var multiMaterial = new THREE.MultiMaterial(createdMaterials);
        mesh = (!isLine ? new THREE.Mesh(buffergeometry, multiMaterial) : new THREE.Line(buffergeometry, multiMaterial));
      } else {
        mesh = (!isLine ? new THREE.Mesh(buffergeometry, createdMaterials[0]) : new THREE.Line(buffergeometry, createdMaterials[0]));
      }
      mesh.name = object.name;
      container.add(mesh);
    }
    return container;
  }
}; 
              
function loadIslandSand(scene) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_sand.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({ color: 0xFBD09B });
      }
    });
    scene.add(object);
  });
}

function loadIslandRock(scene) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_rock.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({ color: 0xD37B45 });
      }
    });
    scene.add(object);
  });
}

function loadIslandWater(scene, successCallback) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_water.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xC7E4fC,
          emissive: 0x37647C,
          opacity: 0.9,
          transparent: true,
          roughness: 0.1,
          metalness: 0.5,
          specular: 1.0
        });
      }
    });
    scene.add(object);
    if (!!successCallback && typeof successCallback == "function") {
      successCallback()
    }
  });
}

function loadIslandMountain(scene) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_mountain.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({ color: 0x999999 });
      }
    });
    scene.add(object);
  });
}

function loadIslandGreen(scene) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_green.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({ color: 0x339933 });
      }
    });
    scene.add(object);
  });
}

function loadIslandLightGreen(scene) {
  var objloader = new THREE_OBJLoader();
  objloader.load('./models/island_lightgreen.obj', function (object) {
    object.scale.set(11, 11, 11);
    object.position.set(0, -8, -10);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({ color: 0x33aa33 });
      }
    });
    scene.add(object);
  });
}

function initAboutText(scene, ffontLoader) {
  ffontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    let textgeometry = new THREE.TextGeometry( '?', {
      font: font,
      size: 8,
      height: .1,
      curveSegments: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelOffset: 0,
      bevelSegments: 2
    } );
    const textobject = new THREE.Mesh( textgeometry, new THREE.MeshStandardMaterial( { color: 0xff0000, emissive: 0x220000 } ) );
    textobject.position.z = 37.5
    textobject.name = "about_section"
    textobject.position.x = 6.5
    textobject.position.y = -9
    textobject.rotation.y = -0.25 
    scene.add( textobject );
  } );
}
function initDunoText(scene, ffontLoader) {
  ffontLoader.load( 'fonts/Lilita One_Regular.json', function ( font ) {
    let textgeometry = new THREE.TextGeometry( 'DUNO', {
      font: font,
      size: 10,
      height: 1,
      curveSegments: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelOffset: 0,
      bevelSegments: 2
    } );
    const textobject = new THREE.Mesh( textgeometry, new THREE.MeshStandardMaterial( { color: 0xffffff } ) );
    textobject.position.z = 15
    textobject.position.x = -20
    textobject.position.y = 5
    textobject.rotation.y = -0.25 
    scene.add( textobject );
  } );
}
function initWebText(scene, ffontLoader) {
  
  {
    ffontLoader.load( 'fonts/Lilita One_Regular.json', function ( font ) {
      let textgeometry = new THREE.TextGeometry( 'web', {
        font: font,
        size: 13,
        height: 1,
        curveSegments: 2,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 0.5,
        bevelOffset: 0,
        bevelSegments: 2
      } );
      const textobject = new THREE.Mesh( textgeometry, new THREE.MeshStandardMaterial( { color: 0xffffff } ) );
      textobject.name = "contact_section"
      textobject.position.z = 13
      textobject.position.x = -17
      textobject.position.y = 25
      textobject.rotation.x = 0.5 
      textobject.rotation.y = 0.25 
      scene.add( textobject );
    } );
  }
}
function initArtText(scene, ffontLoader) {
  
  {
    ffontLoader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {
      let textgeometry = new THREE.TextGeometry( `
                                Design, Modeling & Rendering:
        
                                Characters & People
                                Games & Films
                                 Products & Motion Graphics
                                  Prototyping & Fashion
                                    Unbuilt Spaces
                                      Real State
                                `, {
        font: font,
        size: 0.1,
        height: 0.01,
      } );
      const textobject = new THREE.Mesh( textgeometry, 
        new THREE.MeshLambertMaterial( { color: 0x000, emissive: 0x000 } ) );
        textobject.name = "art_section"
        textobject.position.x = 47
        textobject.position.z = 79
        textobject.position.y = 3.4
        textobject.rotation.y = 0.5
        scene.add( textobject );
        const sphereGeometry = new THREE.SphereGeometry(2, 32, 32); // Sphere geometry with radius 1
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777, opacity: 0.9, transparent: true }); // Red color
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.name = "art_section"
        
        sphereMesh.position.set(48.2, 2, 76); // Position the sphere
        
        scene.add( sphereMesh )
        const sphereGeometry2 = new THREE.SphereGeometry(8, 3, 3); // Sphere geometry with radius 1
        const sphereMaterial2 = new THREE.MeshLambertMaterial({ color: 0xC0B6A3,castShadow:true,   }); // Red color
        const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
        sphereMesh2.name = "contact_section"
        
        sphereMesh2.position.set(-22, -9, -8); // Position the sphere
        
        scene.add( sphereMesh2 )
      } );
    }
    
}
function initCodeText(scene, ffontLoader) {
  {
    ffontLoader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {
      let textgeometry = new THREE.TextGeometry( `
                                  Full-Stack Multi-Platform
                                Software Development
        
                              Planing & Diagramming
                              Data Design & Class Modeling
                              UI/UX Design & Development
                              3D Products Catalogue
                                Third Part Integrations
                                  3D Website Development`, {
        font: font,
        size: 0.15,
        height: 0.01,
      } );
      const textobject = new THREE.Mesh( textgeometry, 
        new THREE.MeshLambertMaterial( { color: 0x000 } ) );
        
        textobject.name = "code_section"
        
        textobject.position.x = -22.5
        textobject.position.y = -11
        textobject.position.z = 38
        textobject.rotation.y = -0.4
        scene.add( textobject );
        // Adding a sphere
        const sphereGeometry = new THREE.SphereGeometry(2.85, 32, 32); // Sphere geometry with radius 1
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777, opacity: 0.9, transparent: true }); // Red color
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.name = "code_section"
        
        sphereMesh.position.set(-19.6, -13, 36); // Position the sphere
        
        scene.add( sphereMesh )
        
      } );
    }

}
function initGamesText(scene, ffontLoader) {
  
    
  {
    ffontLoader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {
      let textgeometry = new THREE.TextGeometry(
        `
                               I use Blender,
                             ZBrush/Sculptris
                            GIMP, PS, AE
                            Mixamo, C4D,
                             Three.js (WebGL)
                              JS, React, Vue
                                        Web3
                            `
        , {
          font: font,
          size: 0.3,
          height: 0.01,
        } );
        const textobject = new THREE.Mesh( textgeometry,
          new THREE.MeshLambertMaterial( { color: 0x000 } ) );
          
          textobject.position.x = 52           
          textobject.position.z = -37
          textobject.position.y = 5.2
          textobject.rotation.y = Math.PI/1.5
          textobject.name = "game_section"
          
          
          scene.add( textobject );
          
          
          
          const sphereGeometry = new THREE.SphereGeometry(2.9, 32, 32); // Sphere geometry with radius 1
          const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777, opacity: 0.9, transparent: true }); // Red color
          const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphereMesh.name = "game_section"
          
          sphereMesh.position.set(46, 2, -41.25); // Position the sphere
          
          scene.add( sphereMesh )
          
          
          
        } );
      }

}

export {
  initAboutText,
  initDunoText,
  initWebText,
  initArtText,
  initCodeText,
  initGamesText,


  loadIslandSand,
  loadIslandRock,
  loadIslandWater,
  loadIslandMountain,
  loadIslandGreen,
  loadIslandLightGreen
};