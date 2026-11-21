/**
 * ark-agent-plan — host entry.
 *
 * The plugin's substance is `cordis.patch.yml`: it seeds the Volcengine Ark
 * provider routes onto the shared `llm-pi-ai` adapter with the Agent Plan model
 * catalog current as of 2026-11-21. This module exists so the bundle ships a
 * real, importable entry artifact, and so the bundle owns a Loader row that
 * appears in Settings › Plugins.
 *
 * Nothing in the patch mounts this module by name; if a loader does import it,
 * it is a harmless no-op.
 *
 * @module ark-agent-plan
 */

export const name = 'ark-agent-plan'

/** No-op: provider routes are contributed by cordis.patch.yml, not here. */
export function apply() {}
