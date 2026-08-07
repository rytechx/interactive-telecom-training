import CableTester from '../../objects/telecom/CableTester.jsx'
import NetworkRack from '../../objects/telecom/NetworkRack.jsx'
import {
  CrimpingTool,
  RJ45Connector,
  WireStripper,
} from '../../objects/telecom/RJ45ToolSet.jsx'
import InteractiveTool from '../../tools/InteractiveTool.jsx'
import { RJ45_TOOL_CONFIGS, TOOL_IDS } from '../../tools/toolConfigs.js'

function getToolPlacement(tool) {
  return {
    position: tool.restPosition,
    rotation: tool.restRotation,
    scale: tool.scale,
  }
}

export default function TelecomEquipment({
  rj45WorkbenchPosition = [-5, 0, -2.5],
  networkRackPosition = [-4.8, 0, -9.2],
}) {
  const toolsById = Object.fromEntries(
    RJ45_TOOL_CONFIGS.map((tool) => [tool.id, tool]),
  )
  const crimpingToolPlacement = getToolPlacement(
    toolsById[TOOL_IDS.CRIMPING_TOOL],
  )
  const wireStripperPlacement = getToolPlacement(
    toolsById[TOOL_IDS.WIRE_STRIPPER],
  )
  const connectorPlacement = getToolPlacement(
    toolsById[TOOL_IDS.RJ45_CONNECTOR],
  )
  const testerPlacement = getToolPlacement(
    toolsById[TOOL_IDS.CABLE_TESTER],
  )

  return (
    <group>
      <NetworkRack position={networkRackPosition} />
      <group position={rj45WorkbenchPosition}>
        <InteractiveTool
          tool={toolsById[TOOL_IDS.CRIMPING_TOOL]}
          workbenchPosition={crimpingToolPlacement.position}
        >
          <CrimpingTool
            position={crimpingToolPlacement.position}
            rotation={crimpingToolPlacement.rotation}
            scale={crimpingToolPlacement.scale}
          />
        </InteractiveTool>
        <InteractiveTool
          tool={toolsById[TOOL_IDS.WIRE_STRIPPER]}
          workbenchPosition={wireStripperPlacement.position}
        >
          <WireStripper
            position={wireStripperPlacement.position}
            rotation={wireStripperPlacement.rotation}
            scale={wireStripperPlacement.scale}
          />
        </InteractiveTool>
        <InteractiveTool
          tool={toolsById[TOOL_IDS.RJ45_CONNECTOR]}
          workbenchPosition={connectorPlacement.position}
        >
          <RJ45Connector
            position={connectorPlacement.position}
            rotation={connectorPlacement.rotation}
            scale={connectorPlacement.scale}
          />
        </InteractiveTool>
        <InteractiveTool
          tool={toolsById[TOOL_IDS.CABLE_TESTER]}
          workbenchPosition={testerPlacement.position}
        >
          <CableTester
            position={testerPlacement.position}
            rotation={testerPlacement.rotation}
            scale={testerPlacement.scale}
          />
        </InteractiveTool>
      </group>
    </group>
  )
}
