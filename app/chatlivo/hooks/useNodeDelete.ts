import { useReactFlow } from "reactflow";
import { useAppDispatch } from "@/app/utils/hooks";
import { removeComponent } from "@/app/store/Slices/automationSlice";

export const useNodeDelete = (nodeId: string) => {
  const dispatch = useAppDispatch();
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    dispatch(removeComponent(nodeId));
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  return handleDelete;
};
