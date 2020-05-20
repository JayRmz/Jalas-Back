const validation = require('../util/validation');

exports.createUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "name",
                            "require": true,
                            "verification": validation.isAlphaSpace,
                            "children": []
                        },
                        {
                            "name": "lastName",
                            "require": true,
                            "verification": validation.isAlphaSpace,
                            "children": []
                        },
                        {
                            "name": "email",
                            "require": true,
                            "verification": validation.isEmail,
                            "children": []
                        },
                        {
                            "name": "password",
                            "require": true,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "birthday",
                            "require": true,
                            "verification": validation.isDate,
                            "children": []
                        },
                        {
                            "name": "sex",
                            "require": true,
                            "verification": validation.isAlpha,
                            "children": []
                        },
                        {
                            "name": "phone",
                            "require": true,
                            "verification": validation.isPhone,
                            "children": []
                        },
                        {
                            "name": "conf",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "favorites",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "location",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children":
                                            [
                                                {
                                                    "name": "city",
                                                    "require": true,
                                                    "verification": validation.isAlphaNumeric,
                                                    "children": []
                                                },
                                                {
                                                    "name": "state",
                                                    "require": true,
                                                    "verification": validation.isAlphaNumeric,
                                                    "children": []
                                                }
                                            ]
                                    },
                                    {
                                        "name": "genres",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "events",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "radio",
                                        "require": false,
                                        "verification": validation.isFloat,
                                        "children": []
                                    },
                                    {
                                        "name": "description",
                                        "require": false,
                                        "verification": validation.escape,
                                        "children": []
                                    }
                                ]
                        }
                    ]
                }

            ]
    };

exports.validateCredentials =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "email",
                                "require": true,
                                "verification": validation.isEmail,
                                "children": []
                            },
                            {
                                "name": "password",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.updateUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "name",
                                "require": true,
                                "verification": validation.isAlphaSpace,
                                "children": []
                            },
                            {
                                "name": "lastName",
                                "require": true,
                                "verification": validation.isAlphaSpace,
                                "children": []
                            },
                            {
                                "name": "birthday",
                                "require": true,
                                "verification": validation.isDate,
                                "children": []
                            },
                            {
                                "name": "sex",
                                "require": true,
                                "verification": validation.isAlpha,
                                "children": []
                            },
                            {
                                "name": "phone",
                                "require": true,
                                "verification": validation.isPhone,
                                "children": []
                            }

                        ]
                }
            ]
    }

exports.getUserInfo =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.getUserProfile =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.updateUserPassword =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "password",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.verifyMail =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "email",
                                "require": true,
                                "verification": validation.isEmail,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setProfileImageUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setBannerImageUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteProfileImageUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteBannerImageUser =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.createEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "name",
                            "require": true,
                            "verification": validation.isAlphaSpace,
                            "children": []
                        },
                        {
                            "name": "email",
                            "require": true,
                            "verification": validation.isEmail,
                            "children": []
                        },
                        {
                            "name": "password",
                            "require": true,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "phone",
                            "require": true,
                            "verification": validation.isPhone,
                            "children": []
                        },
                        {
                            "name": "group",
                            "require": true,
                            "verification": validation.isAlphaNumeric,
                            "children": []
                        },
                        {
                            "name": "conf",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "category",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "location",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children":
                                            [
                                                {
                                                    "name": "latitude",
                                                    "require": true,
                                                    "verification": validation.isLatitude,
                                                    "children": []
                                                },
                                                {
                                                    "name": "longitude",
                                                    "require": true,
                                                    "verification": validation.isLongitude,
                                                    "children": []
                                                },
                                                {
                                                    "name": "address",
                                                    "require": true,
                                                    "verification": validation.escape,
                                                    "children": []
                                                }
                                            ]
                                    },
                                    {
                                        "name": "genres",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "hours",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "images",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children":
                                            [
                                                {
                                                    "name": "profileImage",
                                                    "require": false,
                                                    "verification": validation.pass,
                                                    "children": []
                                                },
                                                {
                                                    "name": "bannerImage",
                                                    "require": false,
                                                    "verification": validation.pass,
                                                    "children": []
                                                }
                                            ]
                                    },
                                    {
                                        "name": "gallery",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "description",
                                        "require": false,
                                        "verification": validation.escape,
                                        "children": []
                                    }
                                ]
                        }
                    ]
                }

            ]
    };

exports.updateEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "name",
                                "require": true,
                                "verification": validation.isAlphaSpace,
                                "children": []
                            },
                            {
                                "name": "phone",
                                "require": true,
                                "verification": validation.isPhone,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.getEstablishmentInfo =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.updateEstablishmentPassword =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "password",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setProfileImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setBannerImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteProfileImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteBannerImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.addImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.removeImageEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.createEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "name",
                            "require": true,
                            "verification": validation.isAlphaSpace,
                            "children": []
                        },
                        {
                            "name": "latitude",
                            "require": true,
                            "verification": validation.isLatitude,
                            "children": []
                        },
                        {
                            "name": "longitude",
                            "require": true,
                            "verification": validation.isLongitude,
                            "children": []
                        },
                        {
                            "name": "idEstablishment",
                            "require": true,
                            "verification": validation.isId,
                            "children": []
                        },
                        {
                            "name": "conf",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "description",
                                        "require": false,
                                        "verification": validation.escape,
                                        "children": []
                                    },
                                    {
                                        "name": "address",
                                        "require": false,
                                        "verification": validation.escape,
                                        "children": []
                                    },
                                    {
                                        "name": "genres",
                                        "require": false,
                                        "verification": validation.isIdArray,
                                        "children": []
                                    },
                                    {
                                        "name": "date",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "images",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children":
                                            [
                                                {
                                                    "name": "profileImage",
                                                    "require": false,
                                                    "verification": validation.pass,
                                                    "children": []
                                                },
                                                {
                                                    "name": "bannerImage",
                                                    "require": false,
                                                    "verification": validation.pass,
                                                    "children": []
                                                },
                                                {
                                                    "name": "promotionImage",
                                                    "require": false,
                                                    "verification": validation.pass,
                                                    "children": []
                                                }
                                            ]
                                    },
                                    {
                                        "name": "gallery",
                                        "require": false,
                                        "verification": validation.pass,
                                        "children": []
                                    }
                                ]
                        }
                    ]
                }

            ]
    };

exports.updateEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "name",
                                "require": true,
                                "verification": validation.isAlphaSpace,
                                "children": []
                            },
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.getEventInfo =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setProfileImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setBannerImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.setPromotionImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteProfileImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deleteBannerImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.deletePromotionImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.addImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.pass,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.removeImageEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "image",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.createUserConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "favorites",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "genres",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "events",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "radio",
                            "require": false,
                            "verification": validation.isFloat,
                            "children": []
                        },
                        {
                            "name": "description",
                            "require": false,
                            "verification": validation.escape,
                            "children": []
                        },
                        {
                            "name": "location",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "city",
                                        "require": true,
                                        "verification": validation.isAlphaNumeric,
                                        "children": []
                                    },
                                    {
                                        "name": "state",
                                        "require": true,
                                        "verification": validation.isAlphaNumeric,
                                        "children": []
                                    }
                                ]
                        },
                        {
                            "name": "images",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "profileImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "bannerImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    }
                                ]
                        }

                    ]
                }

            ]
    };

exports.createEstablishmentConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "category",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "genres",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "hours",
                            "require": false,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "gallery",
                            "require": false,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "description",
                            "require": false,
                            "verification": validation.escape,
                            "children": []
                        },
                        {
                            "name": "location",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "latitude",
                                        "require": true,
                                        "verification": validation.isLatitude,
                                        "children": []
                                    },
                                    {
                                        "name": "longitude",
                                        "require": true,
                                        "verification": validation.isLongitude,
                                        "children": []
                                    },
                                    {
                                        "name": "address",
                                        "require": true,
                                        "verification": validation.escape,
                                        "children": []
                                    }
                                ]
                        },
                        {
                            "name": "images",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "profileImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "bannerImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    }
                                ]
                        }

                    ]
                }

            ]
    };

exports.createEventConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": [
                        {
                            "name": "genres",
                            "require": false,
                            "verification": validation.isIdArray,
                            "children": []
                        },
                        {
                            "name": "date",
                            "require": false,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "gallery",
                            "require": false,
                            "verification": validation.pass,
                            "children": []
                        },
                        {
                            "name": "description",
                            "require": false,
                            "verification": validation.escape,
                            "children": []
                        },
                        {
                            "name": "address",
                            "require": false,
                            "verification": validation.escape,
                            "children": []
                        },
                        {
                            "name": "images",
                            "require": false,
                            "verification": validation.pass,
                            "children":
                                [
                                    {
                                        "name": "profileImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "bannerImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    },
                                    {
                                        "name": "promotionImage",
                                        "require": true,
                                        "verification": validation.pass,
                                        "children": []
                                    }
                                ]
                        }

                    ]
                }

            ]
    };

exports.getUserConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.getEstablishmentConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.getEventConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.updateUserConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":[]
                }

            ]
    };

exports.updateEstablishmentConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": []
                }

            ]
    };

exports.updateEventConf =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children": []
                }

            ]
    };

exports.addFavorite =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.addEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.removeFavorite =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.removeEvent =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "idEvent",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEvents =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEventsPerDate =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            },
                            {
                                "name": "date",
                                "require": true,
                                "verification": validation.isDate,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEventsPerName =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            },
                            {
                                "name": "name",
                                "require": true,
                                "verification": validation.isAlphaNumeric,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEventsPerGenres =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            },
                            {
                                "name": "genres",
                                "require": true,
                                "verification": validation.isIdArray,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEventsPerDate_Genres =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            },
                            {
                                "name": "date",
                                "require": true,
                                "verification": validation.isDate,
                                "children": []
                            },
                            {
                                "name": "genres",
                                "require": true,
                                "verification": validation.isIdArray,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.searchEstablishment =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            }

                        ]
                }

            ]
    };


exports.searchEstablishmentsPerName =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "latitude",
                                "require": true,
                                "verification": validation.isLatitude,
                                "children": []
                            },
                            {
                                "name": "longitude",
                                "require": true,
                                "verification": validation.isLongitude,
                                "children": []
                            },
                            {
                                "name": "distance",
                                "require": true,
                                "verification": validation.isFloat,
                                "children": []
                            },
                            {
                                "name": "name",
                                "require": true,
                                "verification": validation.isAlphaNumeric,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.createReview =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "rating",
                                "require": true,
                                "verification": validation.isInteger,
                                "children": []
                            },
                            {
                                "name": "comment",
                                "require": true,
                                "verification": validation.escape,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.updateReview =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idReview",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            },
                            {
                                "name": "rating",
                                "require": true,
                                "verification": validation.isInteger,
                                "children": []
                            },
                            {
                                "name": "comment",
                                "require": true,
                                "verification": validation.escape,
                                "children": []
                            }

                        ]
                }

            ]
    };

exports.deleteReview =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idReview",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }

            ]
    };

exports.getReview =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }

            ]
    };

exports.getAverage =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }

            ]
    };

exports.getRatings =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idEstablishment",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }

            ]
    };

exports.getUserReviews =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }

            ]
    };

exports.getFavorites =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }

exports.getEvents =
    {
        "fields":
            [
                {
                    "name": "data",
                    "require": true,
                    "verification": validation.pass,
                    "children":
                        [
                            {
                                "name": "idUser",
                                "require": true,
                                "verification": validation.isId,
                                "children": []
                            }
                        ]
                }
            ]
    }











