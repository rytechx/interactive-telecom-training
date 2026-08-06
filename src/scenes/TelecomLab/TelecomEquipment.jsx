import CableTester from '../../objects/telecom/CableTester.jsx'
import NetworkRack from '../../objects/telecom/NetworkRack.jsx'
import {
  CrimpingTool,
  RJ45Connector,
  WireStripper,
} from '../../objects/telecom/RJ45ToolSet.jsx'
import InteractiveTool from '../../tools/InteractiveTool.jsx'
import { RJ45_TOOL_CONFIGS, TOOL_IDS } from '../../tools/toolConfigs.js'

export default function TelecomEquipment({
  rj45WorkbenchPosition = [-5, 0, -2.5],
  networkRackPosition = [-4.8, 0, -9.2],
}) {
  const toolsById = Object.fromEntries(
    RJ45_TOOL_CONFIGS.map((tool) => [tool.id, tool]),
  )

  return (
    <group>
      <NetworkRack position={networkRackPosition} />
      <group position={rj45WorkbenchPosition}>
        <InteractiveTool tool={toolsById[TOOL_IDS.CRIMPING_TOOL]}>
          <CrimpingTool
            position={toolsById[TOOL_IDS.CRIMPING_TOOL].workbenchPosition}
            rotation={toolsById[TOOL_IDS.CRIMPING_TOOL].workbenchRotation}
          />
        </InteractiveTool>
        <InteractiveTool tool={toolsById[TOOL_IDS.WIRE_STRIPPER]}>
          <WireStripper
            position={toolsById[TOOL_IDS.WIRE_STRIPPER].workbenchPosition}
            rotation={toolsById[TOOL_IDS.WIRE_STRIPPER].workbenchRotation}
          />
        </InteractiveTool>
        <InteractiveTool tool={toolsById[TOOL_IDS.RJ45_CONNECTOR]}>
          <RJ45Connector
            position={toolsById[TOOL_IDS.RJ45_CONNECTOR].workbenchPosition}
            rotation={toolsById[TOOL_IDS.RJ45_CONNECTOR].workbenchRotation}
          />
        </InteractiveTool>
        <InteractiveTool tool={toolsById[TOOL_IDS.CABLE_TESTER]}>
          <CableTester
            position={toolsById[TOOL_IDS.CABLE_TESTER].workbenchPosition}
            rotation={toolsById[TOOL_IDS.CABLE_TESTER].workbenchRotation}
          />
        </InteractiveTool>
      </group>
    </group>
  )
}
