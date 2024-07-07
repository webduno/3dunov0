
import * as THREE from 'three';

let THREE_OBJLoader = function(manager) {

    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

    this.materials = null;

    this.regexp = {
        // v float float float
        vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vn float float float
        normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vt float float
        uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // f vertex vertex vertex
        face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
        // f vertex/uv vertex/uv vertex/uv
        face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
        face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
        // f vertex//normal vertex//normal vertex//normal
        face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
        // o object_name | g group_name
        object_pattern: /^[og]\s*(.+)?/,
        // s boolean
        smoothing_pattern: /^s\s+(\d+|on|off)/,
        // mtllib file_reference
        material_library_pattern: /^mtllib /,
        // usemtl material_name
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

                // If the current object (initial from reset) is not from a g/o declaration in the parsed
                // file. We need to use it for the first parsed g/o to keep things in sync.
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

                        // New usemtl declaration overwrites an inherited material, except if faces were declared
                        // after the material, then it must be preserved for proper MultiMaterial continuation.
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

                        // Guarantee at least one empty material, this makes the creation later more straight forward.
                        if (end !== false && this.materials.length === 0) {
                            this.materials.push({
                                name: '',
                                smooth: this.smooth
                            });
                        }

                        return lastMultiMaterial;

                    }
                };

                // Inherit previous objects material.
                // Spec tells us that a declared material must be set to all objects until a new material is declared.
                // If a usemtl declaration is encountered while this new object is being parsed, it will
                // overwrite the inherited material. Exception being that there was already face declarations
                // to the inherited material, then it will be preserved for proper MultiMaterial continuation.

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

                    // Normals are many times the same. If so, skip function call and parseInt.
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

        console.time('OBJLoader');

        var state = this._createParserState();

        if (text.indexOf('\r\n') !== -1) {

            // This is faster than String.split with regex that splits on both
            text = text.replace('\r\n', '\n');

        }

        var lines = text.split('\n');
        var line = '',
            lineFirstChar = '',
            lineSecondChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = (typeof ''.trimLeft === 'function');

        for (var i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if (lineLength === 0) continue;

            lineFirstChar = line.charAt(0);

            // @todo invoke passed in handler if any
            if (lineFirstChar === '#') continue;

            if (lineFirstChar === 'v') {

                lineSecondChar = line.charAt(1);

                if (lineSecondChar === ' ' && (result = this.regexp.vertex_pattern.exec(line)) !== null) {

                    // 0                  1      2      3
                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.vertices.push(
                    parseFloat(result[1]),
                    parseFloat(result[2]),
                    parseFloat(result[3]));

                } else if (lineSecondChar === 'n' && (result = this.regexp.normal_pattern.exec(line)) !== null) {

                    // 0                   1      2      3
                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.normals.push(
                    parseFloat(result[1]),
                    parseFloat(result[2]),
                    parseFloat(result[3]));

                } else if (lineSecondChar === 't' && (result = this.regexp.uv_pattern.exec(line)) !== null) {

                    // 0               1      2
                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    state.uvs.push(
                    parseFloat(result[1]),
                    parseFloat(result[2]));

                } else {

                    throw new Error("Unexpected vertex/normal/uv line: '" + line + "'");

                }

            } else if (lineFirstChar === "f") {

                if ((result = this.regexp.face_vertex_uv_normal.exec(line)) !== null) {

                    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
                    // 0                        1    2    3    4    5    6    7    8    9   10         11         12
                    // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

                    state.addFace(
                    result[1], result[4], result[7], result[10],
                    result[2], result[5], result[8], result[11],
                    result[3], result[6], result[9], result[12]);

                } else if ((result = this.regexp.face_vertex_uv.exec(line)) !== null) {

                    // f vertex/uv vertex/uv vertex/uv
                    // 0                  1    2    3    4    5    6   7          8
                    // ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                    result[1], result[3], result[5], result[7],
                    result[2], result[4], result[6], result[8]);

                } else if ((result = this.regexp.face_vertex_normal.exec(line)) !== null) {

                    // f vertex//normal vertex//normal vertex//normal
                    // 0                     1    2    3    4    5    6   7          8
                    // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                    result[1], result[3], result[5], result[7],
                    undefined, undefined, undefined, undefined,
                    result[2], result[4], result[6], result[8]);

                } else if ((result = this.regexp.face_vertex.exec(line)) !== null) {

                    // f vertex vertex vertex
                    // 0            1    2    3   4
                    // ["f 1 2 3", "1", "2", "3", undefined]

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

                // o object_name
                // or
                // g group_name

                var name = result[0].substr(1).trim();
                state.startObject(name);

            } else if (this.regexp.material_use_pattern.test(line)) {

                // material

                state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);

            } else if (this.regexp.material_library_pattern.test(line)) {

                // mtl file

                state.materialLibraries.push(line.substring(7).trim());

            } else if ((result = this.regexp.smoothing_pattern.exec(line)) !== null) {

                // smooth shading

                // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                // but does not define a usemtl for each face set.
                // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                // This requires some care to not create extra material on each smooth value for "normal" obj files.
                // where explicit usemtl defines geometry groups.
                // Example asset: examples/models/obj/cerberus/Cerberus.obj

                var value = result[1].trim().toLowerCase();
                state.object.smooth = (value === '1' || value === 'on');

                var material = state.object.currentMaterial();
                if (material) {

                    material.smooth = state.object.smooth;

                }

            } else {

                // Handle null terminated files without exception
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

            // Skip o/g line declarations that did not follow with any faces
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

            // Create materials

            var createdMaterials = [];

            for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

                var sourceMaterial = materials[mi];
                var material = undefined;

                if (this.materials !== null) {

                    material = this.materials.create(sourceMaterial.name);

                    // mtl etc. loaders probably 't create line materials correctly, copy properties to a line material.
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

            // Create mesh

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

        console.timeEnd('OBJLoader');

        return container;

    }

}; 















function handleEvent(e) {
        if (INTERSECTED && INTERSECTED.name in actionsLookup) {
        const lookupItem = actionsLookup[INTERSECTED.name];

        var sceness = document.querySelectorAll('.amodalscreen');
        let modalAlreadyOpen = false;
        sceness.forEach(function(adomscene) {
            if (!adomscene.classList.contains('none')) {
                modalAlreadyOpen = true;
                return; // Early return if a modal is already open
            }
        });


        if (modalAlreadyOpen) {
            return;
        } else {
            if (INTERSECTED?.material?.emissive) {
                INTERSECTED.material.emissive.setHex(0x000000);
            }
        }

        let theIndex = lookupItem.goToIndex;
        if (theIndex == THEINDEX) { return; }
        THEINDEX = theIndex;
        SELECTED = { ...scene.children[theIndex + 1] };
        CLICKED = { ...scene.children[theIndex + 1] };
        INTERSECTED = { ...scene.children[theIndex + 1] };

        camera.lookAt(
            SELECTED.position.x + colors[theIndex].camera.lookAt[0],
            SELECTED.position.y + colors[theIndex].camera.lookAt[1],
            SELECTED.position.z + colors[theIndex].camera.lookAt[2]
        );

        sceness.forEach(function(adomscene) {
            if ("modal" + theIndex != adomscene.id) {
                adomscene.className += " none";
            }
        });
        if (document.getElementById("modal" + theIndex)) {
            document.getElementById("modal" + theIndex).classList.toggle("none");
        }
    }
}














    const actionsLookup = {
        "about_section": {
            msg: "Hello World",
            goToIndex: 1,
        },
        "art_section": {
            msg: "Hello World",
            goToIndex: 2,
        },
        "code_section": {
            msg: "Hello World",
            goToIndex: 3,
        },
        "game_section": {
            msg: "Hello World",
            goToIndex: 4,
        },
        "contact_section": {
            msg: "Hello World",
            goToIndex: 5,
        },
    }
			const lerp = (x, y, a) => x * (1 - a) + y * a;
            const loadedWater = false
			let totalTimeElapsed = 0
			let tRate = 0.5
			let container;
			let camera, scene, raycaster, renderer;

            let INTERSECTED;
			let CLICKED;
			let colors;
            let SELECTED;
            let THEINDEX;
			let light;
			let theta = 0;

			const pointer = new THREE.Vector2();
			const radius = 100;

			let orange = false;
			let orangeLevel = 0;
			let orangeDOM;

			let desire = [];

			init();
			animate();











			function init() {
                var closes = document.querySelectorAll('.selfCloseButton')
                closes.forEach(function(adombutton) {
                  // adombutton is the current element
                  adombutton.onclick = function(e) {
                        e.currentTarget.parentNode.parentNode.parentNode.classList.toggle("none")
                        // document.getElementById("modal"+(-(Math.floor(CLICKED.position.z/90)))).classList.toggle("none")
                    // }
                  }
                })
                var sceness = document.querySelectorAll('.scene-goto')
                sceness.forEach(function(adomscene) {
                  // adomscene is the current element
                  adomscene.onclick = function(e) {
                    let theIndex = parseInt(e.currentTarget.id.replace("scene",""))
                    THEINDEX =  theIndex
                    SELECTED =  {...scene.children[theIndex+1]}
                    CLICKED =   {...scene.children[theIndex+1]}
                    INTERSECTED =   {...scene.children[theIndex+1]}
                    
                    camera.lookAt(
                        SELECTED.position.x + colors[theIndex].camera.lookAt[0],
                        SELECTED.position.y + colors[theIndex].camera.lookAt[1],
                        SELECTED.position.z + colors[theIndex].camera.lookAt[2]
                    )

                    var sceness = document.querySelectorAll('.amodalscreen')
                    sceness.forEach(function(adomscene) {
                        if ("modal"+theIndex != adomscene.id)
                        {
                            adomscene.className += " none"
                        } else {
                        }
                    })
                    if ( document.getElementById("modal"+theIndex ) )
                    {
                        document.getElementById("modal"+theIndex ).classList.toggle("none")
                    }

                  }
                });

document.addEventListener("mousedown", handleEvent);
document.addEventListener("touchstart", handleEvent);

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 10000 );
				camera.position.z = 50
				camera.lookAt(0,0,0)

				scene = new THREE.Scene();

				light = new THREE.PointLight( 0xFFDE9F, 1.5, 100 );
    light.position.set( 40, 10, 40 );
    light.castShadow = true;            
    scene.add( light );

    
    light = new THREE.PointLight( 0xFFDE9F, 1, 75 );
    light.position.set( -15, 5, -50 );
    light.castShadow = true;           
    scene.add( light );

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

				colors = [
                                {
                                    img:"./img/wp2100821-1187062037.jpg",
                                    wireframe:false,
                                    camera:{pos:[0,0,0],lookAt:[0,0,0]},
                                    box:{pos:[0,0,0],scale:[0,0,0],rot:[0,0,0],},
                                    color:0xff9999,
                                },





                                {
                                    img:"./img/grrrid.jpg",
                                    wireframe:false,
                                    camera:{pos:[30,30,90],lookAt:[0,0,0]},
                                    box:{pos:[0, -0,0],scale:[0,0,0],rot:[0,0,(3.14/4)*3],},
                                    color:0xff9999,
                                },





								{
                                    img:"./img/th-1084040338.jpg",
                                    wireframe:false,
                                    camera:{pos:[50 ,5,55],lookAt:[0,0,0]},
                                    box:{pos:[0,0,0],scale:[0,0,0],rot:[0,0,0],},
                                    color:0xffcc99,
                                },                           
                                
								{
                                    img:"./img/th-813177686.jpg",
                                    wireframe:false,
                                    camera:{pos:[-20 ,-10,20],lookAt:[0,0,0]},
                                    box:{pos:[0,0,0],scale:[0,0,0],rot:[0.0,0,0],},
                                    color:0xffff99,
                                },                
								{
                                    img:"./img/grad5.jpg",
                                    wireframe:false,
                                    camera:{pos:[59 ,7,-66],lookAt:[0,0,0]},
                                    box:{pos:[0,0,-0],scale:[0,0,0],rot:[0,0,0],},
                                    color:0xccff99,
                                },













                                
								{
                                    img:"./img/grad6.jpg",
                                    wireframe:false,
                                    camera:{pos:[-40 ,5,-55],lookAt:[0,0,0]},
                                    box:{pos:[0,0,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0x99ffcc,
                                },
								{
                                    img:"./img/grad1.jpg",
                                    wireframe:true,
                                    camera:{pos:[20 ,5,15],lookAt:[0,0,0]},
                                    box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0x99ccff,
                                },
								{
                                    img:"./img/grad1.jpg",
                                    wireframe:false,
                                    camera:{pos:[20 ,5,15],lookAt:[0,0,0]},
                                    box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0x9999ff,
                                },
								{
                                    img:"./img/grad1.jpg",
                                    wireframe:false,
                                    camera:{pos:[20 ,5,15],lookAt:[0,0,0]},
                                    box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0xcc99ff,
                                },
								{
                                    img:"img/grad1.jpg",
                                    wireframe:false,
                                    camera:{pos:[0,  120,0],lookAt:[0,0,0]},
                                    box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0xff99ff,
                                },
								{
                                    img:"img/grad1.jpg",
                                    wireframe:false,
                                    camera:{pos:[0,  120,0],lookAt:[0,0,0]},
                                    box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
                                    color:0xff99cc
                                    ,}
						]

				var objloader = new THREE_OBJLoader();
				let teslaT;
                objloader.load( './models/island_sand.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true
                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
                            child.material = new THREE.MeshLambertMaterial({ color: 0xFBD09B })
                        }
                    });
                    scene.add( object );
                } );


                
                objloader.load( './models/island_rock.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true


                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
                            child.material = new THREE.MeshLambertMaterial({ color: 0xD37B45 })
                        }
                    });
                    scene.add( object );
                } );
                
                objloader.load( './models/island_water.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    document.getElementById("loadingWater").className += " finishedLoading"
                    document.getElementById("mainlogo").className += document.getElementById("mainlogo").className.replace("none","")
                    
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true


                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
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
                    scene.add( object );
                } );

                
                objloader.load( './models/island_mountain.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true


                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
                            child.material = new THREE.MeshLambertMaterial({ color: 0x999999 })
                        }
                    });
                    scene.add( object );
                } );

                
                objloader.load( './models/island_green.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true


                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
                            child.material = new THREE.MeshLambertMaterial({ color: 0x339933 })
                        }
                    });
                    scene.add( object );
                } );


                objloader.load( './models/island_lightgreen.obj', function ( object ) {
                  object.scale.set(11,11,11)
                    object.position.x = 0
                    object.position.z = -10
                    object.position.y = -8
                    object.castShadow = true


                    object.traverse( function (child)
                    {
                        if ( child instanceof THREE.Mesh )
                        {
                            child.material = new THREE.MeshLambertMaterial({ color: 0x33aa33 })
                        }
                    });
                    scene.add( object );
                } );


				const ffontLoader = new THREE.FontLoader();
                {
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
                {
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

                            textobject.position.x = 53           
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
				for ( let i = 0; i < 5; i ++ ) {
                    const geometry = new THREE.BoxGeometry( colors[i].box.scale[0],colors[i].box.scale[1],colors[i].box.scale[2] );

					const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({ wireframe: colors[i].wireframe, map: THREE.ImageUtils.loadTexture(colors[i].img) }) );

					object.position.z = (-0.9*i) + colors[i].box.pos[2]
                    object.position.y = colors[i].box.pos[1]
                    object.position.x = colors[i].box.pos[0]
                    object.rotation.x = colors[i].box.rot[0]
                    object.rotation.y = colors[i].box.rot[1]
					object.rotation.z = colors[i].box.rot[2]
					object.scale.x = 10
					object.scale.y = 10 - i*2 < 1 ? 1 : 10 - i*2
					object.scale.z = 10


					scene.add( object );

				}

				raycaster = new THREE.Raycaster();

                renderer = new THREE.WebGLRenderer({ alpha: true });

				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );



				document.addEventListener( 'mousemove', onPointerMove );


				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onPointerMove( event ) {

				pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			}


			function animate() {
				totalTimeElapsed += 1
				requestAnimationFrame( animate );

				render();
			}

			function render() {
				if (orange)
				{
					let asd = parseInt(INTERSECTED.id)
					orangeLevel += asd
				} else {
				}

				theta += tRate;
				tRate += 0.0001;


				camera.updateMatrixWorld();


				if (INTERSECTED && INTERSECTED.position.y < 0)
				{

				}

				raycaster.setFromCamera( pointer, camera );

				const intersects = raycaster.intersectObjects( scene.children, false );

				if ( intersects.length > 0 ) {

					if ( INTERSECTED != intersects[ 0 ].object ) {

						if ( INTERSECTED )
						{
							if(INTERSECTED?.material?.emissive) { INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex ); }
						}

						INTERSECTED = intersects[ 0 ].object;
						if (INTERSECTED.id > 10 && INTERSECTED.id <= 21)
						{
							orange = true
						}
						if(INTERSECTED?.material?.emissive) { INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex(); }
						if(INTERSECTED?.material?.emissive) { INTERSECTED.material.emissive.setHex( 0x005500 ); }

                        if (INTERSECTED.name in actionsLookup) {
                            const lookupItem = actionsLookup[INTERSECTED.name]
                            if (lookupItem.goToIndex) {
                                if (!                    document.getElementById("loadingWater").className.includes("finishedLoading") || totalTimeElapsed < 9 ) {

return;
}






















function isMobileDevice() {
    let hasTouchScreen = false;
    let isMobileUA = false;

    if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
    } else if (window.matchMedia && matchMedia("(pointer:coarse)").matches) {
        hasTouchScreen = true;
    } else if ('orientation' in window) {
        hasTouchScreen = true; // This is a deprecated method but a good fallback.
    } else {
        const userAgent = navigator.userAgent;
        isMobileUA = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
    }

    // Ensure it's truly a mobile device and not a desktop with touch support
    if (hasTouchScreen) {
        if (!isMobileUA && window.innerWidth > 800) {
            hasTouchScreen = false;
        }
    }

    return hasTouchScreen || isMobileUA;
}
if (isMobileDevice()) {
    // alert()
    setTimeout(()=>{
        handleEvent({})
    }, 300)
}














                            }


                        }

					}

				} else {

					if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
					if (orange)
					{
						orangeLevel -= parseInt(orangeLevel / 2)
					}
					orange = false
					
					INTERSECTED = null;

				}

					if (SELECTED) {

						camera.position.z = lerp(
							camera.position.z,
							SELECTED.position.z + 26+(colors[THEINDEX] ? colors[THEINDEX].camera.pos[2]:0 ),
							0.25)
						if (colors[THEINDEX])
						{
                            camera.position.x = lerp(camera.position.x ,colors[THEINDEX].camera.pos[0],.05)
                            camera.position.y = lerp(camera.position.y ,colors[parseInt(THEINDEX)].camera.pos[1],.05)
						}
						camera.lookAt( SELECTED.position.x, SELECTED.position.y+colors[parseInt(THEINDEX)].camera.lookAt[1], SELECTED.position.z   );
					} else {
					}
						camera.position.y = camera.position.y+ Math.sin(totalTimeElapsed/20)/80

				renderer.render( scene, camera );

			}