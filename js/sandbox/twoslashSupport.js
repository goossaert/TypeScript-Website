define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.twoslashCompletions = exports.parsePrimitive = exports.extractTwoSlashComplierOptions = void 0;
    const booleanConfigRegexp = /^\/\/\s?@(\w+)$/;
    // https://regex101.com/r/8B2Wwh/1
    const valuedConfigRegexp = /^\/\/\s?@(\w+):\s?(.+)$/;
    /**
     * This is a port of the twoslash bit which grabs compiler options
     * from the source code
     */
    const extractTwoSlashComplierOptions = (ts) => {
        let optMap = new Map();
        // @ts-ignore - optionDeclarations is not public API
        for (const opt of ts.optionDeclarations) {
            optMap.set(opt.name.toLowerCase(), opt);
        }
        return (code) => {
            const codeLines = code.split("\n");
            const options = {};
            codeLines.forEach(line => {
                let match;
                if ((match = booleanConfigRegexp.exec(line))) {
                    if (optMap.has(match[1].toLowerCase())) {
                        options[match[1]] = true;
                        setOption(match[1], "true", options, optMap);
                    }
                }
                else if ((match = valuedConfigRegexp.exec(line))) {
                    if (optMap.has(match[1].toLowerCase())) {
                        setOption(match[1], match[2], options, optMap);
                    }
                }
            });
            return options;
        };
    };
    exports.extractTwoSlashComplierOptions = extractTwoSlashComplierOptions;
    function setOption(name, value, opts, optMap) {
        const opt = optMap.get(name.toLowerCase());
        if (!opt)
            return;
        switch (opt.type) {
            case "number":
            case "string":
            case "boolean":
                opts[opt.name] = parsePrimitive(value, opt.type);
                break;
            case "list":
                opts[opt.name] = value.split(",").map(v => parsePrimitive(v, opt.element.type));
                break;
            default:
                opts[opt.name] = opt.type.get(value.toLowerCase());
                if (opts[opt.name] === undefined) {
                    const keys = Array.from(opt.type.keys());
                    console.log(`Invalid value ${value} for ${opt.name}. Allowed values: ${keys.join(",")}`);
                }
        }
    }
    function parsePrimitive(value, type) {
        switch (type) {
            case "number":
                return +value;
            case "string":
                return value;
            case "boolean":
                return value.toLowerCase() === "true" || value.length === 0;
        }
        console.log(`Unknown primitive type ${type} with - ${value}`);
    }
    exports.parsePrimitive = parsePrimitive;
    // Function to generate autocompletion results
    const twoslashCompletions = (ts, monaco) => (model, position, _token) => {
        // Split everything the user has typed on the current line up at each space, and only look at the last word
        const thisLine = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
        });
        // Not a comment
        if (!thisLine.startsWith("//")) {
            return { suggestions: [] };
        }
        const words = thisLine.replace("\t", "").split(" ");
        // Not the right amount of
        if (words.length !== 2) {
            return { suggestions: [] };
        }
        const word = words[1];
        // Not a @ at the first word
        if (!word.startsWith("@")) {
            return { suggestions: [] };
        }
        const result = [];
        const knowns = [
            "noErrors",
            "errors",
            "showEmit",
            "showEmittedFile",
            "noStaticSemanticInfo",
            "emit",
            "noErrorValidation",
            "filename"
        ];
        // @ts-ignore - ts.optionDeclarations is private
        const optsNames = ts.optionDeclarations.map(o => o.name);
        knowns.concat(optsNames).forEach(name => {
            if (name.startsWith(word.slice(1))) {
                // @ts-ignore - somehow adding the range seems to not give autocomplete results?
                result.push({
                    label: name,
                    kind: 14,
                    detail: "Twoslash comment",
                    insertText: name,
                });
            }
        });
        return {
            suggestions: result,
        };
    };
    exports.twoslashCompletions = twoslashCompletions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdvc2xhc2hTdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdHdvc2xhc2hTdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFBQSxNQUFNLG1CQUFtQixHQUFHLGlCQUFpQixDQUFBO0lBRTdDLGtDQUFrQztJQUNsQyxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFBO0lBS3BEOzs7T0FHRztJQUVJLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxFQUFNLEVBQUUsRUFBRTtRQUN2RCxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFBO1FBRW5DLG9EQUFvRDtRQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTtZQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDeEM7UUFFRCxPQUFPLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNsQyxNQUFNLE9BQU8sR0FBRyxFQUFTLENBQUE7WUFFekIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxLQUFLLENBQUE7Z0JBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtvQkFDNUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO3dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO3dCQUN4QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7cUJBQzdDO2lCQUNGO3FCQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ2xELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTt3QkFDdEMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO3FCQUMvQztpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxPQUFPLENBQUE7UUFDaEIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBM0JZLFFBQUEsOEJBQThCLGtDQTJCMUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLElBQXFCLEVBQUUsTUFBd0I7UUFDN0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUMxQyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU07UUFDaEIsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQ2hCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFNBQVM7Z0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDaEQsTUFBSztZQUVQLEtBQUssTUFBTTtnQkFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBUSxDQUFDLElBQWMsQ0FBQyxDQUFDLENBQUE7Z0JBQzFGLE1BQUs7WUFFUDtnQkFDRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO2dCQUVsRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUNoQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFTLENBQUMsQ0FBQTtvQkFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsS0FBSyxRQUFRLEdBQUcsQ0FBQyxJQUFJLHFCQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDekY7U0FDSjtJQUNILENBQUM7SUFFRCxTQUFnQixjQUFjLENBQUMsS0FBYSxFQUFFLElBQVk7UUFDeEQsUUFBUSxJQUFJLEVBQUU7WUFDWixLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQTtZQUNmLEtBQUssUUFBUTtnQkFDWCxPQUFPLEtBQUssQ0FBQTtZQUNkLEtBQUssU0FBUztnQkFDWixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7U0FDOUQ7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLFdBQVcsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBVkQsd0NBVUM7SUFFRCw4Q0FBOEM7SUFDdkMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEVBQU0sRUFBRSxNQUFzQyxFQUFFLEVBQUUsQ0FBQyxDQUNyRixLQUFnRCxFQUNoRCxRQUEwQyxFQUMxQyxNQUFXLEVBQ1gsRUFBRTtRQUNGLDJHQUEyRztRQUMzRyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO1lBQ3JDLGVBQWUsRUFBRSxRQUFRLENBQUMsVUFBVTtZQUNwQyxXQUFXLEVBQUUsQ0FBQztZQUNkLGFBQWEsRUFBRSxRQUFRLENBQUMsVUFBVTtZQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07U0FDM0IsQ0FBQyxDQUFBO1FBRUYsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUE7U0FDM0I7UUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkQsMEJBQTBCO1FBQzFCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdEIsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQTtTQUMzQjtRQUVELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQiw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekIsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQTtTQUMzQjtRQUVELE1BQU0sTUFBTSxHQUF1RCxFQUFFLENBQUE7UUFFckUsTUFBTSxNQUFNLEdBQUc7WUFDYixVQUFVO1lBQ1YsUUFBUTtZQUNSLFVBQVU7WUFDVixpQkFBaUI7WUFDakIsc0JBQXNCO1lBQ3RCLE1BQU07WUFDTixtQkFBbUI7WUFDbkIsVUFBVTtTQUNYLENBQUE7UUFDRCxnREFBZ0Q7UUFDaEQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNsQyxnRkFBZ0Y7Z0JBQ2hGLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1YsS0FBSyxFQUFFLElBQUk7b0JBQ1gsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsTUFBTSxFQUFFLGtCQUFrQjtvQkFDMUIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCLENBQUMsQ0FBQTthQUNIO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPO1lBQ0wsV0FBVyxFQUFFLE1BQU07U0FDcEIsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQTNEWSxRQUFBLG1CQUFtQix1QkEyRC9CIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYm9vbGVhbkNvbmZpZ1JlZ2V4cCA9IC9eXFwvXFwvXFxzP0AoXFx3KykkL1xuXG4vLyBodHRwczovL3JlZ2V4MTAxLmNvbS9yLzhCMld3aC8xXG5jb25zdCB2YWx1ZWRDb25maWdSZWdleHAgPSAvXlxcL1xcL1xccz9AKFxcdyspOlxccz8oLispJC9cblxudHlwZSBUUyA9IHR5cGVvZiBpbXBvcnQoXCJ0eXBlc2NyaXB0XCIpXG50eXBlIENvbXBpbGVyT3B0aW9ucyA9IGltcG9ydChcInR5cGVzY3JpcHRcIikuQ29tcGlsZXJPcHRpb25zXG5cbi8qKlxuICogVGhpcyBpcyBhIHBvcnQgb2YgdGhlIHR3b3NsYXNoIGJpdCB3aGljaCBncmFicyBjb21waWxlciBvcHRpb25zXG4gKiBmcm9tIHRoZSBzb3VyY2UgY29kZVxuICovXG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHdvU2xhc2hDb21wbGllck9wdGlvbnMgPSAodHM6IFRTKSA9PiB7XG4gIGxldCBvcHRNYXAgPSBuZXcgTWFwPHN0cmluZywgYW55PigpXG5cbiAgLy8gQHRzLWlnbm9yZSAtIG9wdGlvbkRlY2xhcmF0aW9ucyBpcyBub3QgcHVibGljIEFQSVxuICBmb3IgKGNvbnN0IG9wdCBvZiB0cy5vcHRpb25EZWNsYXJhdGlvbnMpIHtcbiAgICBvcHRNYXAuc2V0KG9wdC5uYW1lLnRvTG93ZXJDYXNlKCksIG9wdClcbiAgfVxuXG4gIHJldHVybiAoY29kZTogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgY29kZUxpbmVzID0gY29kZS5zcGxpdChcIlxcblwiKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7fSBhcyBhbnlcblxuICAgIGNvZGVMaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgbGV0IG1hdGNoXG4gICAgICBpZiAoKG1hdGNoID0gYm9vbGVhbkNvbmZpZ1JlZ2V4cC5leGVjKGxpbmUpKSkge1xuICAgICAgICBpZiAob3B0TWFwLmhhcyhtYXRjaFsxXS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgIG9wdGlvbnNbbWF0Y2hbMV1dID0gdHJ1ZVxuICAgICAgICAgIHNldE9wdGlvbihtYXRjaFsxXSwgXCJ0cnVlXCIsIG9wdGlvbnMsIG9wdE1hcClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICgobWF0Y2ggPSB2YWx1ZWRDb25maWdSZWdleHAuZXhlYyhsaW5lKSkpIHtcbiAgICAgICAgaWYgKG9wdE1hcC5oYXMobWF0Y2hbMV0udG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICBzZXRPcHRpb24obWF0Y2hbMV0sIG1hdGNoWzJdLCBvcHRpb25zLCBvcHRNYXApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0T3B0aW9uKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0czogQ29tcGlsZXJPcHRpb25zLCBvcHRNYXA6IE1hcDxzdHJpbmcsIGFueT4pIHtcbiAgY29uc3Qgb3B0ID0gb3B0TWFwLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpXG4gIGlmICghb3B0KSByZXR1cm5cbiAgc3dpdGNoIChvcHQudHlwZSkge1xuICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIG9wdHNbb3B0Lm5hbWVdID0gcGFyc2VQcmltaXRpdmUodmFsdWUsIG9wdC50eXBlKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgXCJsaXN0XCI6XG4gICAgICBvcHRzW29wdC5uYW1lXSA9IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAodiA9PiBwYXJzZVByaW1pdGl2ZSh2LCBvcHQuZWxlbWVudCEudHlwZSBhcyBzdHJpbmcpKVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBvcHRzW29wdC5uYW1lXSA9IG9wdC50eXBlLmdldCh2YWx1ZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgICBpZiAob3B0c1tvcHQubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShvcHQudHlwZS5rZXlzKCkgYXMgYW55KVxuICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCB2YWx1ZSAke3ZhbHVlfSBmb3IgJHtvcHQubmFtZX0uIEFsbG93ZWQgdmFsdWVzOiAke2tleXMuam9pbihcIixcIil9YClcbiAgICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQcmltaXRpdmUodmFsdWU6IHN0cmluZywgdHlwZTogc3RyaW5nKTogYW55IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgcmV0dXJuICt2YWx1ZVxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICByZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUubGVuZ3RoID09PSAwXG4gIH1cbiAgY29uc29sZS5sb2coYFVua25vd24gcHJpbWl0aXZlIHR5cGUgJHt0eXBlfSB3aXRoIC0gJHt2YWx1ZX1gKVxufVxuXG4vLyBGdW5jdGlvbiB0byBnZW5lcmF0ZSBhdXRvY29tcGxldGlvbiByZXN1bHRzXG5leHBvcnQgY29uc3QgdHdvc2xhc2hDb21wbGV0aW9ucyA9ICh0czogVFMsIG1vbmFjbzogdHlwZW9mIGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikpID0+IChcbiAgbW9kZWw6IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuZWRpdG9yLklUZXh0TW9kZWwsXG4gIHBvc2l0aW9uOiBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLlBvc2l0aW9uLFxuICBfdG9rZW46IGFueVxuKSA9PiB7XG4gIC8vIFNwbGl0IGV2ZXJ5dGhpbmcgdGhlIHVzZXIgaGFzIHR5cGVkIG9uIHRoZSBjdXJyZW50IGxpbmUgdXAgYXQgZWFjaCBzcGFjZSwgYW5kIG9ubHkgbG9vayBhdCB0aGUgbGFzdCB3b3JkXG4gIGNvbnN0IHRoaXNMaW5lID0gbW9kZWwuZ2V0VmFsdWVJblJhbmdlKHtcbiAgICBzdGFydExpbmVOdW1iZXI6IHBvc2l0aW9uLmxpbmVOdW1iZXIsXG4gICAgc3RhcnRDb2x1bW46IDAsXG4gICAgZW5kTGluZU51bWJlcjogcG9zaXRpb24ubGluZU51bWJlcixcbiAgICBlbmRDb2x1bW46IHBvc2l0aW9uLmNvbHVtbixcbiAgfSlcblxuICAvLyBOb3QgYSBjb21tZW50XG4gIGlmICghdGhpc0xpbmUuc3RhcnRzV2l0aChcIi8vXCIpKSB7XG4gICAgcmV0dXJuIHsgc3VnZ2VzdGlvbnM6IFtdIH1cbiAgfVxuXG4gIGNvbnN0IHdvcmRzID0gdGhpc0xpbmUucmVwbGFjZShcIlxcdFwiLCBcIlwiKS5zcGxpdChcIiBcIilcbiAgLy8gTm90IHRoZSByaWdodCBhbW91bnQgb2ZcbiAgaWYgKHdvcmRzLmxlbmd0aCAhPT0gMikge1xuICAgIHJldHVybiB7IHN1Z2dlc3Rpb25zOiBbXSB9XG4gIH1cblxuICBjb25zdCB3b3JkID0gd29yZHNbMV1cbiAgLy8gTm90IGEgQCBhdCB0aGUgZmlyc3Qgd29yZFxuICBpZiAoIXdvcmQuc3RhcnRzV2l0aChcIkBcIikpIHtcbiAgICByZXR1cm4geyBzdWdnZXN0aW9uczogW10gfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0OiBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLmxhbmd1YWdlcy5Db21wbGV0aW9uSXRlbVtdID0gW11cblxuICBjb25zdCBrbm93bnMgPSBbXG4gICAgXCJub0Vycm9yc1wiLFxuICAgIFwiZXJyb3JzXCIsXG4gICAgXCJzaG93RW1pdFwiLFxuICAgIFwic2hvd0VtaXR0ZWRGaWxlXCIsXG4gICAgXCJub1N0YXRpY1NlbWFudGljSW5mb1wiLFxuICAgIFwiZW1pdFwiLFxuICAgIFwibm9FcnJvclZhbGlkYXRpb25cIixcbiAgICBcImZpbGVuYW1lXCJcbiAgXVxuICAvLyBAdHMtaWdub3JlIC0gdHMub3B0aW9uRGVjbGFyYXRpb25zIGlzIHByaXZhdGVcbiAgY29uc3Qgb3B0c05hbWVzID0gdHMub3B0aW9uRGVjbGFyYXRpb25zLm1hcChvID0+IG8ubmFtZSlcbiAga25vd25zLmNvbmNhdChvcHRzTmFtZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aCh3b3JkLnNsaWNlKDEpKSkge1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWVob3cgYWRkaW5nIHRoZSByYW5nZSBzZWVtcyB0byBub3QgZ2l2ZSBhdXRvY29tcGxldGUgcmVzdWx0cz9cbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbGFiZWw6IG5hbWUsXG4gICAgICAgIGtpbmQ6IDE0LFxuICAgICAgICBkZXRhaWw6IFwiVHdvc2xhc2ggY29tbWVudFwiLFxuICAgICAgICBpbnNlcnRUZXh0OiBuYW1lLFxuICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHtcbiAgICBzdWdnZXN0aW9uczogcmVzdWx0LFxuICB9XG59XG4iXX0=