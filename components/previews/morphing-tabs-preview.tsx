"use client"

import * as React from "react"
import { Activity, Settings2, SquareTerminal } from "lucide-react"

import { MorphingTabs, MorphingTabsPanel } from "@/registry/components/morphing-tabs"

const LAYOUT_ID = "morphing-tabs-preview"

const ITEMS = [
  {
    value: "overview",
    label: "Overview",
    icon: <SquareTerminal />,
    panelId: "morphing-tabs-preview-overview",
    body: "Six services healthy. Last deploy 12 minutes ago by @dana.",
  },
  {
    value: "activity",
    label: "Activity",
    icon: <Activity />,
    badge: 12,
    panelId: "morphing-tabs-preview-activity",
    body: "12 new events since you last checked, across 3 environments.",
  },
  {
    value: "settings",
    label: "Settings",
    icon: <Settings2 />,
    panelId: "morphing-tabs-preview-settings",
    body: "Region pinning is on. Preview deployments expire after 7 days.",
  },
]

export default function MorphingTabsPreview() {
  const [pill, setPill] = React.useState("overview")
  const [underline, setUnderline] = React.useState("overview")

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center gap-3">
        <MorphingTabs
          label="Project sections"
          value={pill}
          onValueChange={setPill}
          layoutId={LAYOUT_ID}
          items={ITEMS}
        />
        {ITEMS.map((item) => (
          <MorphingTabsPanel
            key={item.value}
            id={item.panelId}
            value={item.value}
            activeValue={pill}
            // `MorphingTabs` derives tab ids from `layoutId`, so this matches.
            tabId={`${LAYOUT_ID}-tab-${item.value}`}
            className="max-w-md text-center text-sm text-muted-foreground"
          >
            {item.body}
          </MorphingTabsPanel>
        ))}
      </div>

      <MorphingTabs
        variant="underline"
        size="sm"
        label="Documentation sections"
        value={underline}
        onValueChange={setUnderline}
        layoutId="morphing-tabs-preview-underline"
        items={ITEMS.map(({ value, label }) => ({ value, label }))}
      />
    </div>
  )
}
