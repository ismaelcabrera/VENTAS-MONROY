<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the administrator prototype on `/admin` with isolated in-memory demo data; it must never read or modify real customer, inventory, or role data until real administration is requested.
- Treat the prototype sign-in form as a presentation transition only: accept nonempty fictional inputs in memory, never validate real credentials or assign roles, and reset demo state on exit.
- Share the presentation transition through an in-memory external store between the storefront login dialog and demo route; never persist it or treat it as authentication.
- Use manifest-only home-screen support without app-shell service workers because offline use has not been requested.
- Keep phone push registration in a dedicated messaging worker and handle foreground delivery in the browser; never add app-shell caching for notifications.
- Remote demo alerts require a separately verified account and owner-scoped device/event tables; the presentation transition never authorizes them, and fictional inventory remains in memory.
