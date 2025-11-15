import {useGLTF} from '@react-three/drei'

export default function Model(props) {
  const { scene } = useGLTF("assets/3d_model/scene.gltf");

  return <primitive object={scene} {...props} />;
}