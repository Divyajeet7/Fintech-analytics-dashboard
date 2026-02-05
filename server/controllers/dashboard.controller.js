const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/VerifyToken');

const loanSchema = require('../../../models/loan.model.js')
const repaymentSchema = require('../../../models/repayment.model.js')
const userSchema = require('../../../models/user.model.js')

const { getAllLoansByMapping } = require('../../../services/getAllLoansByMapping');
const { buildLoanMatch } = require('../../../services/buildLoanMatch');

router.get('/dashboard/collections', verifyToken, async (req, res) => {
  try {
    const dbUser = await userSchema.findOne({ EmailID: req.user.email }).exec();
    const allLoans = await getAllLoansByMapping(dbUser);
    const allowedLoanIds = allLoans.map(l => l.Loan_ID);

    const {
      location,
      salesPerson,
      lender,
      loanProduct,
      fromDate,
      toDate
    } = req.query;

    // if (!fromDate || !toDate) {
    //   return res.status(400).json({ msg: 'fromDate and toDate are required' });
    // }

    const loanMatch = buildLoanMatch({
      allowedLoanIds,
      filters: { location, salesPerson, lender, loanProduct }
    });

    // console.log(loanMatch)

    // ------------------ DATE RANGE LOGIC ------------------
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0, 0, 0, 0
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const buildDateRange = (fromDate, toDate) => {
      if (fromDate && toDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);

        return { $gte: start, $lte: end };
      }

      return { $gte: startOfMonth, $lte: endOfMonth };
    };

    const dateRange = buildDateRange(fromDate, toDate);

    // console.log(dateRange);

    const pipeline = [
      { $match: loanMatch },

      {
        $lookup: {
          from: repaymentSchema.collection.name,
          localField: 'Loan_ID',
          foreignField: 'Loan_ID',
          as: 'repayments'
        }
      },

      { $unwind: '$repayments' },

      {
        $facet: {
          // ---------------- DEMAND ----------------
          demand: [
            {
              $match: {
                // 'repayments.EMI_Date': {
                //   $gte: new Date(fromDate),
                //   $lte: new Date(toDate)
                // }
                'repayments.EMI_Date': dateRange
              }
            },
            {
              $group: {
                _id: null,
                emiDemand: { $sum: { $ifNull: ['$repayments.EMI_Amount', 0] } },
                principalDemand: { $sum: { $ifNull: ['$repayments.EMI_Principle', 0] } },
                interestDemand: { $sum: { $ifNull: ['$repayments.EMI_Intrest', 0] } },
                emiDemandCount: { $sum: 1 }
              }
            }
          ],

          // ---------------- COLLECTIONS ----------------
          collections: [
            { $unwind: { path: '$repayments.collectionArray', preserveNullAndEmptyArrays: false } },

            {
              $match: {
                // 'repayments.collectionArray.collectionDate': {
                //   $gte: new Date(fromDate),
                //   $lte: new Date(toDate)
                // }
                'repayments.collectionArray.collectionDate': dateRange
              }
            },
            {
              $group: {
                _id: null,
                principalCollected: {
                  $sum: { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] }
                },
                interestCollected: {
                  $sum: { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] }
                },
                chargesCollected: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
                      { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
                      { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
                    ]
                  }
                },
                lpcNbcChargesCollected: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
                      { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] }
                    ]
                  }
                },
                rocChargesCollected: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
                    ]
                  }
                },
                emiCollected: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] },
                      { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] }
                    ]
                  }
                },
                // emiCollectedCount: { $sum: 1 },

                emiCollectedCount: {
                  $sum: {
                    $cond: [
                      {
                        $gt: [
                          {
                            $add: [
                              { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] },
                              { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] }
                            ]
                          },
                          0
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                principalCollectedCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$repayments.collectionArray.collectedPrinciple', 0] },
                      1,
                      0
                    ]
                  }
                },

                interestCollectedCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$repayments.collectionArray.collectedIntrest', 0] },
                      1,
                      0
                    ]
                  }
                },

                lpcNbcCollectedCount: {
                  $sum: {
                    $cond: [
                      {
                        $gt: [
                          {
                            $add: [
                              { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
                              { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] }
                            ]
                          },
                          0
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },

                rocCollectedCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$repayments.collectionArray.collectedRoc', 0] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const result = await loanSchema.aggregate(pipeline);

    const demand = result[0].demand[0] || {};
    const collections = result[0].collections[0] || {};

    // console.log(result[0].collections[0]);

    res.json({
      emiDemand: demand.emiDemand || 0,
      principalDemand: demand.principalDemand || 0,
      interestDemand: demand.interestDemand || 0,
      emiDemandCount: demand.emiDemandCount || 0,

      emiCollected: collections.emiCollected || 0,
      principalCollected: collections.principalCollected || 0,
      interestCollected: collections.interestCollected || 0,
      chargesCollected: collections.chargesCollected || 0,
      lpcNbcChargesCollected : collections.lpcNbcChargesCollected || 0,
      rocChargesCollected : collections.rocChargesCollected || 0,
      emiCollectedCount: collections.emiCollectedCount || 0,
      principalCollectedCount: collections.principalCollectedCount || 0,
      interestCollectedCount: collections.interestCollectedCount || 0,
      lpcNbcCollectedCount: collections.lpcNbcCollectedCount || 0,
      rocCollectedCount: collections.rocCollectedCount || 0,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Collections dashboard error' });
  }
});

router.get('/dashboard/par', verifyToken, async (req, res) => {
  try {
    const dbUser = await userSchema.findOne({ EmailID: req.user.email }).exec();
    const allLoans = await getAllLoansByMapping(dbUser);
    const allowedLoanIds = allLoans.map(l => l.Loan_ID);
    const filters = req.query;

    const loanMatch = buildLoanMatch({
      allowedLoanIds,
      filters
    });

    // console.log(loanMatch);

    const result = await loanSchema.aggregate([
      { $match: loanMatch },

      {
        $lookup: {
          from: repaymentSchema.collection.name,
          localField: 'Loan_ID',
          foreignField: 'Loan_ID',
          as: 'repayments'
        }
      },

      {
        $addFields: {
          POSDPD: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: '$repayments',
                    as: 'r',
                    cond: {
                      $and: [
                        { $in: ['$$r.EMI_Status', ['UNPAID', 'PART']] },
                        { $gt: ['$$r.EMI_dpd', 0] }
                      ]
                    }
                  }
                },
                as: 'x',
                in: '$$x.EMI_dpd'
              }
            }
          },

          outstanding: {
            $sum: {
              $map: {
                input: '$repayments',
                as: 'r',
                in: { $ifNull: ['$$r.EMI_Principle', 0] }
              }
            }
          }
        }
      },

      {
        $facet: {
          // totalAUM: [
          //   { $group: { _id: null, value: { $sum: '$outstanding' }, count: { $sum: 1 } } }
          // ],

          totalAUM: [
            { $match: { outstanding: { $gt: 0 } } },
            {
              $group: {
                _id: null,
                value: { $sum: '$outstanding' },
                count: { $sum: 1 }
              }
            }
          ],

          // delinquentAUM: [
          //   { $match: { POSDPD: { $gt: 0 } } },
          //   { $group: { _id: null, value: { $sum: '$outstanding' }, count: { $sum: 1 } } }
          // ],

          delinquentAUM: [
            {
              $match: {
                POSDPD: { $gt: 0 },
                outstanding: { $gt: 0 }
              }
            },
            {
              $group: {
                _id: null,
                value: { $sum: '$outstanding' },
                count: { $sum: 1 }
              }
            }
          ],

          // buckets: [
          //   { $match: { POSDPD: { $gt: 0 } } },
          //   {
          //     $bucket: {
          //       groupBy: '$POSDPD',
          //       boundaries: [1, 31, 61, 91, Infinity],
          //       default: '90+',
          //       output: {
          //         value: { $sum: '$outstanding' },
          //         count: { $sum: 1 }
          //       }
          //     }
          //   }
          // ],

          buckets: [
            { $match: { POSDPD: { $gt: 0 } } },

            {
              $bucket: {
                groupBy: '$POSDPD',
                boundaries: [
                  1,     // 1–30
                  31,    // 31–60
                  61,    // 61–90
                  91,    // 91–120
                  121,   // 121–150
                  151,   // 151–180
                  181,   // 180+
                  Infinity
                ],
                default: '180+',
                output: {
                  value: { $sum: '$outstanding' },
                  count: { $sum: 1 }
                }
              }
            }
          ],

          // overdueCollections: [
          //   // 1️⃣ Only delinquent loans
          //   { $match: { POSDPD: { $gt: 0 } } },

          //   // 2️⃣ Break EMIs
          //   { $unwind: '$repayments' },

          //   // 3️⃣ Only UNPAID / PART EMIs
          //   {
          //     $match: {
          //       'repayments.EMI_Status': { $in: ['UNPAID', 'PART'] }
          //     }
          //   },

          //   // 4️⃣ Aggregate overdue values
          //   {
          //     $group: {
          //       _id: null,

          //       overduePrincipal: {
          //         $sum: { $ifNull: ['$repayments.EMI_Principle', 0] }
          //       },

          //       overdueInterest: {
          //         $sum: { $ifNull: ['$repayments.EMI_Intrest', 0] }
          //       },

          //       overdueCharges: {
          //         $sum: {
          //           $add: [
          //             { $ifNull: ['$repayments.EMI_Roll_Over_Charge', 0] },
          //             { $ifNull: ['$repayments.EMI_LPC', 0] },
          //             { $ifNull: ['$repayments.EMI_NACH_Charge', 0] }
          //           ]
          //         }
          //       },
          //       overdueEmiCount: { $sum: 1 }
          //     }
          //   },

          //   // 5️⃣ Compute derived fields
          //   {
          //     $addFields: {
          //       overdueEMI: {
          //         $add: ['$overduePrincipal', '$overdueInterest']
          //       },
          //       totalOverdue: {
          //         $add: [
          //           { $add: ['$overduePrincipal', '$overdueInterest'] },
          //           '$overdueCharges'
          //         ]
          //       },
          //       overduePrincipalCount: '$overdueEmiCount',
          //       overdueInterestCount: '$overdueEmiCount',
          //       overdueChargesCount: '$overdueEmiCount'
          //     }
          //   }
          // ]
          overdueCollections: [
            // 1️⃣ Only delinquent loans
            { $match: { POSDPD: { $gt: 0 } } },

            // 2️⃣ Break EMIs
            { $unwind: '$repayments' },

            // 3️⃣ Only UNPAID / PART EMIs
            {
              $match: {
                'repayments.EMI_Status': { $in: ['UNPAID', 'PART'] }
              }
            },

            // 4️⃣ Aggregate amounts + conditional counts
            {
              $group: {
                _id: null,

                // ---------- AMOUNTS ----------
                overduePrincipal: {
                  $sum: { $ifNull: ['$repayments.EMI_Principle', 0] }
                },

                overdueInterest: {
                  $sum: { $ifNull: ['$repayments.EMI_Intrest', 0] }
                },

                overdueCharges: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$repayments.EMI_Roll_Over_Charge', 0] },
                      { $ifNull: ['$repayments.EMI_LPC', 0] },
                      { $ifNull: ['$repayments.EMI_NACH_Charge', 0] }
                    ]
                  }
                },

                // ---------- COUNTS ----------
                overdueEmiCount: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $gt: ['$repayments.EMI_Principle', 0] },
                          { $gt: ['$repayments.EMI_Intrest', 0] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },

                overduePrincipalCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$repayments.EMI_Principle', 0] },
                      1,
                      0
                    ]
                  }
                },

                overdueInterestCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$repayments.EMI_Intrest', 0] },
                      1,
                      0
                    ]
                  }
                },

                overdueChargesCount: {
                  $sum: {
                    $cond: [
                      {
                        $gt: [
                          {
                            $add: [
                              { $ifNull: ['$repayments.EMI_Roll_Over_Charge', 0] },
                              { $ifNull: ['$repayments.EMI_LPC', 0] },
                              { $ifNull: ['$repayments.EMI_NACH_Charge', 0] }
                            ]
                          },
                          0
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            },

            // 5️⃣ Derived totals
            {
              $addFields: {
                overdueEMI: {
                  $add: ['$overduePrincipal', '$overdueInterest']
                },

                totalOverdue: {
                  $add: [
                    { $add: ['$overduePrincipal', '$overdueInterest'] },
                    '$overdueCharges'
                  ]
                }
              }
            }
                    ],
          onTimeAUM: [
            {
              $match: {
                outstanding: { $gt: 0 },
                $or: [
                  { POSDPD: { $eq: 0 } },
                  { POSDPD: { $eq: null } }
                ]
              }
            },
            {
              $group: {
                _id: null,
                value: { $sum: '$outstanding' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
      // {
      //   $facet: {
      //     trend: [
      //       {
      //         $group: {
      //           _id: {
      //             $dateToString: {
      //               format: '%Y-%m-%d',
      //               date: '$repayments.collectionArray.collectionDate'
      //             }
      //           },

      //           principalCollected: {
      //             $sum: { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] }
      //           },
      //           interestCollected: {
      //             $sum: { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] }
      //           },
      //           chargesCollected: {
      //             $sum: {
      //               $add: [
      //                 { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
      //               ]
      //             }
      //           },
      //           totalCollected: {
      //             $sum: {
      //               $add: [
      //                 { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
      //               ]
      //             }
      //           }
      //         }
      //       },
      //       { $sort: { _id: 1 } },
      //       {
      //         $project: {
      //           _id: 0,
      //           date: '$_id',
      //           principalCollected: 1,
      //           interestCollected: 1,
      //           chargesCollected: 1,
      //           totalCollected: 1
      //         }
      //       }
      //     ],

      //     summary: [
      //       {
      //         $group: {
      //           _id: null,
      //           principalCollected: {
      //             $sum: { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] }
      //           },
      //           interestCollected: {
      //             $sum: { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] }
      //           },
      //           chargesCollected: {
      //             $sum: {
      //               $add: [
      //                 { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
      //               ]
      //             }
      //           },
      //           totalCollected: {
      //             $sum: {
      //               $add: [
      //                 { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
      //                 { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
      //               ]
      //             }
      //           }
      //         }
      //       }
      //     ]
      //   }
      // }
    ]);

    // console.log(result[0]);

    const overdue = result[0].overdueCollections[0] || {
      overdueEMI: 0,
      overduePrincipal: 0,
      overdueInterest: 0,
      overdueCharges: 0,
      totalOverdue: 0,

      overdueEmiCount: 0,
      overduePrincipalCount: 0,
      overdueInterestCount: 0,
      overdueChargesCount: 0
    };

    // console.log(result[0].totalAUM[0],result[0].delinquentAUM[0]);

    // res.json({
    //   totalAUM: result[0].totalAUM[0] || { value: 0, count: 0 },
    //   delinquentAUM: result[0].delinquentAUM[0] || { value: 0, count: 0 },
    //   buckets: result[0].buckets,
    //   overdueCollections: overdue
    // });

    res.json({
      totalAUM: result[0].totalAUM[0] || { value: 0, count: 0 },
      delinquentAUM: result[0].delinquentAUM[0] || { value: 0, count: 0 },
      onTimeAUM: result[0].onTimeAUM[0] || { value: 0, count: 0 },
      buckets: result[0].buckets,
      overdueCollections: overdue
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Dashboard error' });
  }
});

router.get('/dashboard/par/drill', verifyToken, async (req, res) => {
  try {
    const { type, name, page = 1, limit = 50 } = req.query;
    
    const dbUser = await userSchema.findOne({ EmailID: req.user.email }).exec();
    const allLoans = await getAllLoansByMapping(dbUser);
    const allowedLoanIds = allLoans.map(l => l.Loan_ID);
    
    const skip = (Number(page) - 1) * Number(limit);
    const {
      location,
      salesPerson,
      lender,
      loanProduct
    } = req.query;

    const filters = {
      location,
      salesPerson,
      lender,
      loanProduct
    };
    
    const loanMatch = buildLoanMatch({
      allowedLoanIds,
      filters
    });
    // Build DPD filter
    let dpdMatch = {};

    if (type === 'metric') {
      if (name === 'Delinquent AUM') {
        dpdMatch = { POSDPD: { $gt: 0 } };
      }
    }

    if (type === 'bucket') {
      if (name === '1-30') dpdMatch = { POSDPD: { $gte: 1, $lte: 30 } };
      if (name === '31-60') dpdMatch = { POSDPD: { $gte: 31, $lte: 60 } };
      if (name === '61-90') dpdMatch = { POSDPD: { $gte: 61, $lte: 90 } };
      if (name === '90+') dpdMatch = { POSDPD: { $gt: 90 } };
    }
    const result = await loanSchema.aggregate([
      { $match: loanMatch },

      {
        $lookup: {
          from: repaymentSchema.collection.name,
          localField: 'Loan_ID',
          foreignField: 'Loan_ID',
          as: 'repayments'
        }
      },

      {
        $addFields: {
          POSDPD: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: '$repayments',
                    as: 'r',
                    cond: {
                      $and: [
                        { $in: ['$$r.EMI_Status', ['UNPAID', 'PART']] },
                        { $gt: ['$$r.EMI_dpd', 0] }
                      ]
                    }
                  }
                },
                as: 'x',
                in: '$$x.EMI_dpd'
              }
            }
          },

          outstanding: {
            $sum: {
              $map: {
                input: '$repayments',
                as: 'r',
                in: { $ifNull: ['$$r.EMI_Principle', 0] }
              }
            }
          }
        }
      },

      { $match: dpdMatch },

      {
        $project: {
          _id: 0,
          loanId: '$Loan_ID',
          customerName: '$Applicant_name',
          outstanding: 1,
          dpd: '$POSDPD',
          emiDate: { $max: '$repayments.EMI_Date' },
          status: '$loanStatus'
        }
      },

      {
        $facet: {
          data: [
            { $sort: { dpd: -1 } },
            { $skip: skip },
            { $limit: Number(limit) }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      data: result[0].data,
      total: result[0].total[0]?.count || 0,
      page: Number(page),
      limit: Number(limit)
    });

  } catch (err) {
    console.error('PAR drilldown error:', err);
    res.status(500).send({ msg: 'Drilldown error' });
  }
});

router.get('/dashboard/daily-trend', verifyToken, async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      location,
      salesPerson,
      lender,
      loanProduct
    } = req.query;

    const dbUser = await userSchema.findOne({ EmailID: req.user.email }).exec();
    if (!dbUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const allLoans = await getAllLoansByMapping(dbUser);
    const allowedLoanIds = allLoans.map(l => l.Loan_ID);

    if (!allowedLoanIds.length) {
      return res.json([]);
    }

    const filters = { location, salesPerson, lender, loanProduct };

    // ------------------ LOAN FILTER ------------------
    const loanMatch = buildLoanMatch({
      allowedLoanIds,
      filters
    });

    // ------------------ DATE RANGE LOGIC ------------------
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0, 0, 0, 0
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const buildDateRange = (fromDate, toDate) => {
      if (fromDate && toDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);

        return { $gte: start, $lte: end };
      }

      return { $gte: startOfMonth, $lte: endOfMonth };
    };

    const dateRange = buildDateRange(fromDate, toDate);

    // ------------------ AGGREGATION ------------------
    const trend = await loanSchema.aggregate([
      { $match: loanMatch },

      {
        $lookup: {
          from: repaymentSchema.collection.name,
          let: { loanId: '$Loan_ID' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$Loan_ID', '$$loanId'] },
                EMI_Status: { $in: ['PAID', 'PART'] }
              }
            },

            { $unwind: '$collectionArray' },

            {
              $match: {
                'collectionArray.collectionDate': dateRange
              }
            }
          ],
          as: 'repayments'
        }
      },

      { $unwind: '$repayments' },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$repayments.collectionArray.collectionDate'
            }
          },

          principalCollected: {
            $sum: {
              $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0]
            }
          },

          interestCollected: {
            $sum: {
              $ifNull: ['$repayments.collectionArray.collectedIntrest', 0]
            }
          },

          chargesCollected: {
            $sum: {
              $add: [
                { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
              ]
            }
          },

          totalCollected: {
            $sum: {
              $add: [
                { $ifNull: ['$repayments.collectionArray.collectedPrinciple', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedIntrest', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedLpc', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedNbc', 0] },
                { $ifNull: ['$repayments.collectionArray.collectedRoc', 0] }
              ]
              // $add: [
              //   { $ifNull: ['$repayments.collectionArray.collectionAmount', 0] } // If we need to show extra collection amount in total collected
              // ]
            }
          }
        }
      },

      { $sort: { _id: 1 } },

      {
        $project: {
          _id: 0,
          date: '$_id',
          principalCollected: 1,
          interestCollected: 1,
          chargesCollected: 1,
          totalCollected: 1
        }
      }
    ]);

    // console.log(trend);
    res.json(trend);

  } catch (err) {
    console.error('Daily trend error:', err);
    res.status(500).json({ msg: 'Daily trend error' });
  }
});
