import todos from "./todos"

describe("todos reducer", () => {
    it("should handle inital state", () => {
        expect(
            todos(undefined, {})
        ).toEqual([])
    })

    it("should handle ADD_TODO", () => {
        expect(
            todos([], {
                type: "ADD_TODO",
                text: "Run the tests.",
                id: 0
            })
        ).toEqual([
            {
                text: "Run the tests.",
                id: 0,
                completed: false
            }
        ])

        expect(
            todos([{
                text: "Run the tests.",
                completed: false,
                id: 0
            }], {
                type: "ADD_TODO",
                text: "Add new tests.",
                id: 1
            })
        ).toEqual([
            {
                text: "Run the tests.",
                id: 0,
                completed: false
            },
            {
                text: "Add new tests.",
                id: 1,
                completed: false
            }
        ])

        expect(
            todos([
                {
                    text: "Run the tests.",
                    id: 0,
                    completed: false
                },
                {
                    text: "Add new tests.",
                    id: 1,
                    completed: false
                }
            ], {
                    type: "ADD_TODO",
                    text: "Use Redux",
                    id: 2
            })
        ).toEqual([
                {
                    text: "Run the tests.",
                    id: 0,
                    completed: false
                },
                {
                    text: "Add new tests.",
                    id: 1,
                    completed: false
                },
                {
                    text: "Use Redux",
                    id: 2,
                    completed: false
                }
            ])
        
    })
    it("should handle DELETED_TODO", () => {
        expect(
            todos([
                {
                    text: "Run the tests",
                    completed: false,
                    id: 1
                },
                {
                    text: "Run new tests",
                    completed: false,
                    id: 2
                }
            ],{
                type: "DELETE_TODO",
                id: 1
            })
        ).toEqual(
                [{
                    text: "Run new tests",
                    completed: false,
                    id: 2
                }]
            )
        
    })

    it("should handle TOGGLE_TODO", () => {
        expect(
            todos([
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Run the text",
                    id: 1,
                    completed: false
                }
            ], {
                type: "TOGGLE_TODO",
                id: 1
            })
        ).toEqual(
            [
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Run the text",
                    id: 1,
                    completed: true
                }
            ]
        )
        expect(
            todos([
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Run the text",
                    id: 1,
                    completed: true
                }
            ], {
                type: "TOGGLE_TODO",
                id: 1
            })
        ).toEqual(
            [
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Run the text",
                    id: 1,
                    completed: false
                }
            ]
        )
    })

    it("should handle TOGGLE_TODO", () => {
        expect(
            todos([
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Run the text",
                    id: 1,
                    completed: false
                }
            ], {
                    type: "EDIT_TODO",
                    text: "Fix the text",
                    id: 1
                })
        ).toEqual(
            [
                {
                    text: "Text todo is completed",
                    id: 0,
                    completed: false
                },
                {
                    text: "Fix the text",
                    id: 1,
                    completed: false
                }
            ]
            )
    })


})
